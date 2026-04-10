# Backend (backecomm)

## Local development

1. Install packages:

   npm install

2. Create env file:

   Copy .env.example to .env

3. Start server:

   npm run dev

Server runs on PORT (default 3000).

## Required environment variables

- JWT_SECRET
- MONGODB_URL
- CLIENT_URL (comma-separated allowed origins)
- PORT
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- NODE_ENV
- COOKIE_SAME_SITE
- COOKIE_SECURE

## Deployment settings

For production, use:

- NODE_ENV=production
- COOKIE_SAME_SITE=none
- COOKIE_SECURE=true
- CLIENT_URL=https://your-frontend-domain.com

Health check endpoint:

- /api/health
