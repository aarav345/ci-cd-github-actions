# 🚀 GitHub Actions Deployment with SSH (Staging + Production)

This guide explains how to set up **secure SSH-based deployments** from GitHub Actions to two EC2 instances:

- **Staging Server**
- **Production Server**

Using a single SSH keypair for automated deployments.

---

## ✅ 1. Generate SSH Keypair (Local Machine)

Create a new SSH key only for GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
```

This generates:

- `~/.ssh/github_actions` → private key  
- `~/.ssh/github_actions.pub` → public key

---

## ✅ 2. Install Public Key on Both EC2 Machines

### AWS EC2 does NOT support password authentication  
So `ssh-copy-id` will not work.  
We install the key **manually**.

### Step 1: Show your public key

```bash
cat ~/.ssh/github_actions.pub
```

Copy the output.

### Step 2: SSH into EC2 using your AWS `.pem` key

```bash
ssh -i "your-aws-key.pem" ubuntu@your-ec2-ip
```

### Step 3: Add the public key to `authorized_keys`

Inside EC2:

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
```

Paste the public key.

Save & exit.

### Step 4: Fix permissions

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Repeat these steps for both servers:

- Staging EC2  
- Production EC2

---

## ✅ 3. Add GitHub Secrets

Go to:

**GitHub → Repository → Settings → Secrets → Actions**

Add:

| Secret Name | Value |
|------------|-------|
| `SSH_PRIVATE_KEY` | contents of `~/.ssh/github_actions` |
| `STAGING_SERVER_IP` | your staging EC2 IP |
| `PRODUCTION_SERVER_IP` | your production EC2 IP |
| `API_KEY` | your app key |
| `GITHUB_TOKEN` | auto-created by GitHub |

---

## ✅ 4. GitHub Actions Workflow Example

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: [build-and-push]
  if: github.ref == 'refs/heads/main'

  environment:
    name: staging
    url: http://${{ secrets.STAGING_SERVER_IP }}:3000

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
        chmod 600 ~/.ssh/id_ed25519
        ssh-keyscan -H ${{ secrets.STAGING_SERVER_IP }} >> ~/.ssh/known_hosts

    - name: Deploy to staging
      run: |
        ssh ubuntu@${{ secrets.STAGING_SERVER_IP }} << 'EOF'
          echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker pull ghcr.io/${{ github.repository_owner }}/ci-cd-github-actions:latest
          docker stop my-app || true
          docker rm my-app || true
          docker run -d             --name my-app             --restart unless-stopped             -p 3000:3000             -e NODE_ENV=production             -e API_KEY=${{ secrets.API_KEY }}             ghcr.io/${{ github.repository_owner }}/ci-cd-github-actions:latest
          sleep 5
          curl -f http://localhost:3000/health || exit 1
        EOF
```

---

## 🎉 Done!

Your pipeline is now fully set up:

- One SSH keypair  
- Public key installed on two EC2 servers  
- Private key inside GitHub Secrets  
- GitHub Actions deploys automatically via SSH  
- Secure, simple, and production-ready  