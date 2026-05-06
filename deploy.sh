#!/bin/bash
echo "🔨 Building..."
npm run build

echo "☁️  Syncing to S3..."
aws s3 sync dist/ s3://rosadelima-shop-web --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E3UXEL71AT1QM8 --paths "/*" --no-cli-pager --output text --query 'Invalidation.Status'

echo "✅ Deploy completo!"
