FROM jenkins/jenkins:lts-jdk21

# ============================================================
# PLUGINS
# ============================================================

USER root

RUN jenkins-plugin-cli \
    --plugins \
        git \
        workflow-aggregator \
        ssh-agent \
        sonar

# ============================================================
# SYSTEM DEPENDENCIES & DOCKER CLI
# ============================================================

RUN apt-get update && \
    apt-get install -y \
        git \
        openssh-client \
        rsync \
        curl \
        ca-certificates \
        unzip \
        gnupg \
        && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# NODE.JS 22 LTS
# ============================================================

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# VERIFICATION
# ============================================================

RUN echo "==========================================" && \
    echo " JENKINS BUILD ENVIRONMENT" && \
    echo "==========================================" && \
    echo "" && \
    echo "Node:" && \
    node --version && \
    echo "" && \
    echo "NPM:" && \
    npm --version && \
    echo "" && \
    echo "Git:" && \
    git --version && \
    echo "" && \
    echo "Rsync:" && \
    rsync --version | head -n 1 && \
    echo "" && \
    echo "SSH:" && \
    ssh -V

# ============================================================
# PERMISSIONS & USER
# ============================================================

RUN groupadd -g 999 docker 2>/dev/null || true && \
    usermod -aG docker jenkins 2>/dev/null || true

USER jenkins
