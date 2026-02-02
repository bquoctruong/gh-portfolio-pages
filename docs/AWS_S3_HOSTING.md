# AWS S3 + Cloudflare Static Hosting

This document covers the manual infrastructure setup required for hosting the portfolio site on AWS S3 with Cloudflare as the CDN/SSL layer.

## Architecture

```
User -> Cloudflare (HTTPS/CDN) -> S3 Website Endpoint (HTTP)
```

GitHub Actions deploys `public/` to S3 on every push to `main` that changes files in `public/`.

## AWS S3 Configuration

### Bucket Setup

- **Bucket name**: `bqt-portfolio`
- **Region**: `us-west-1`
- **Static website hosting**: Enabled
  - **Index document**: `index.html`
  - **Error document**: `404.html`
- **Website endpoint**: `http://bqt-portfolio.s3-website-us-west-1.amazonaws.com`

### Bucket Policy (Public Read)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bqt-portfolio/*"
    }
  ]
}
```

### IAM User for GitHub Actions

Create a dedicated IAM user with programmatic access and the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::bqt-portfolio",
        "arn:aws:s3:::bqt-portfolio/*"
      ]
    }
  ]
}
```

Store `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as GitHub repository secrets.

## Cloudflare Configuration

### DNS

- **Type**: CNAME
- **Name**: `bqtruong.com` (or `@`)
- **Target**: `bqt-portfolio.s3-website-us-west-1.amazonaws.com`
- **Proxy status**: Proxied (orange cloud)

### SSL/TLS

- **SSL mode**: Flexible
  - S3 website hosting endpoints are HTTP-only, so Cloudflare terminates SSL and forwards to S3 over HTTP
  - "Full" or "Full (Strict)" will not work since S3 website endpoints don't serve HTTPS

### Caching

Cloudflare respects the `Cache-Control` headers set during S3 sync:
- HTML: 5 minutes (`max-age=300`)
- CSS: 24 hours (`max-age=86400`)
- JS: 24 hours (`max-age=86400`)
- Other assets: 1 hour (`max-age=3600`)

## Cost Estimates

### AWS S3
- **Storage**: ~$0.023/GB/month (site is < 10MB, effectively free)
- **Requests**: $0.004 per 10,000 GET requests
- **Data transfer**: $0.09/GB after first 100GB (Cloudflare caching minimizes this)
- **Estimated monthly cost**: < $1

### Cloudflare
- **Free plan** covers DNS, SSL, CDN, and basic DDoS protection

## Dynamic Features Not Available on S3

The following features from the Node.js server are not available on S3 static hosting:

- `/deepseek` — DeepSeek proxy (requires Node.js + `http-proxy-middleware`)
- `/time` — Server-side time endpoint
- `/python_get` — Python script execution endpoint
- OpenTelemetry tracing and Prometheus metrics
- Dynamic CORS and security header injection (handled partially by Cloudflare)

## Deployment

Deployment is automated via GitHub Actions (`.github/workflows/build-deploy-aws-s3.yml`). On push to `main` that modifies `public/`:

1. Files are synced to S3 with content-type-specific settings
2. A verification step confirms key files exist in the bucket

To manually deploy:

```bash
aws s3 sync public/ s3://bqt-portfolio --delete
```

## Troubleshooting

- **CSS/JS not loading**: Check S3 object content types with `aws s3api head-object --bucket bqt-portfolio --key assets/css/main.css`
- **404 not rendering**: Verify S3 static website hosting has `404.html` set as the error document
- **SSL errors**: Confirm Cloudflare SSL mode is "Flexible", not "Full"
- **Stale content**: Purge Cloudflare cache or wait for `Cache-Control` expiry
