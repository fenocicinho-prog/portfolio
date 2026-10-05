# Configuration de la page admin et des alertes WhatsApp

Le site stocke déjà les demandes de contact dans PostgreSQL (`DATABASE_URL`). Cette fonctionnalité ajoute une page privée `/admin` et envoie une notification WhatsApp au numéro administrateur après l’enregistrement d’une nouvelle demande. En cas d’indisponibilité de Meta, la demande reste enregistrée et le formulaire public reste fonctionnel.

## Chatbot IA avec OpenRouter

Le chatbot produit des réponses contextuelles avec le modèle OpenRouter, en s’appuyant sur le CV, les projets et les services du portfolio. Il répond dans la langue du visiteur avec un ton naturel et des réponses courtes de 3 à 5 phrases ; sans clé, il affiche un avis clair au lieu de simuler une réponse personnalisée.

- `OPENROUTER_API_KEY` : clé secrète créée dans le compte OpenRouter, à définir uniquement côté serveur.
- `OPENROUTER_MODEL` : facultatif ; par défaut `qwen/qwen3-4b:free`.
- `PUBLIC_SITE_URL` : facultatif ; URL du portfolio transmise comme référent à OpenRouter.

Cette clé est indépendante des identifiants Meta WhatsApp et des secrets de la page admin. Ne pas la préfixer par `NEXT_PUBLIC_` et ne jamais l’inscrire dans le dépôt.

## 1. Configurer l’accès à `/admin`

Définir **uniquement dans les variables d’environnement du serveur / hébergeur** :

- `ADMIN_PASSWORD` : mot de passe administrateur long (au moins 16 caractères).
- `ADMIN_SESSION_SECRET` : secret aléatoire d’au moins 32 caractères. Par exemple, générer localement une valeur avec `openssl rand -base64 48`.

Ne pas mettre ces valeurs dans le dépôt, dans un fichier public, ni dans un message WhatsApp. Après les avoir ajoutées côté hébergeur, redéployer le site. Les sessions sont signées côté serveur, dans un cookie `HttpOnly`, `SameSite=Strict`, et expirent après 12 heures. L’API ne retourne aucune demande sans session valide.

## 2. Préparer WhatsApp Cloud API

Dans Meta for Developers / WhatsApp Manager :

1. Configurer un compte WhatsApp Business Platform et un numéro d’envoi Cloud API. Le numéro émetteur doit être associé à `WHATSAPP_PHONE_NUMBER_ID`.
2. Créer un modèle **Utility** (message de service déclenché par une nouvelle demande) dans WhatsApp Manager et attendre qu’il soit **Approved**.
3. Pour le modèle, choisir la langue `fr` (ou celle choisie ci-dessous), le format de paramètres positionnels et un corps contenant exactement cinq variables, par exemple :

   `Nouvelle demande de contact #{{1}}. Nom : {{2}}. WhatsApp : {{3}}. E-mail : {{4}}. Message : {{5}}`

   Fournir un exemple pour chaque variable lors de la création. Les valeurs sont insérées dans cet ordre : numéro de demande, nom, WhatsApp du visiteur, e-mail, message. Le nom du modèle doit être en minuscules avec chiffres / underscores, sans espace.
4. Obtenir un jeton d’accès autorisé à envoyer des messages et noter le Phone Number ID dans les paramètres du compte WhatsApp. Si le destinataire ne se trouve pas dans une fenêtre de service ouverte, Meta n’accepte que les modèles approuvés. Le destinataire administrateur doit également avoir consenti à recevoir ces messages selon les règles WhatsApp.

Dans l’hébergeur, définir les variables côté **serveur seulement** :

- `WHATSAPP_ACCESS_TOKEN` : jeton Meta — secret.
- `WHATSAPP_PHONE_NUMBER_ID` : ID du numéro d’envoi WhatsApp Business.
- `WHATSAPP_ADMIN_TO` : facultatif ; numéro destinataire au format international, chiffres seuls. S’il est omis, le numéro WhatsApp publié dans `content/site.ts` est utilisé.
- `WHATSAPP_TEMPLATE_NAME` : nom exact du modèle approuvé (par défaut `portfolio_new_lead`).
- `WHATSAPP_TEMPLATE_LANGUAGE` : code de langue exact du modèle (par défaut `fr`).
- `WHATSAPP_GRAPH_API_VERSION` : version Graph API (par défaut `v26.0`).

Après configuration, redéployer puis envoyer une demande de test avec un message non sensible. Contrôler dans WhatsApp Manager / les logs Meta que le message est accepté et livré. Le code ne journalise pas le jeton ni le contenu de la demande en cas d’erreur Meta.

## Données et confidentialité

Le formulaire actuel recueille nom, numéro WhatsApp, e-mail et description du projet ; il ne recueille pas de mots de passe ni d’identifiants de connexion. Le texte de consentement indique désormais qu’une notification contenant les éléments de la demande peut être envoyée au propriétaire sur WhatsApp. Les visiteurs doivent éviter d’inclure des données sensibles.

Les demandes complètes restent dans PostgreSQL et sont consultables dans `/admin` (100 plus récentes). L’alerte WhatsApp contient les cinq éléments du modèle. Aucun secret d’accès ou mot de passe ne doit être envoyé par ce canal.
