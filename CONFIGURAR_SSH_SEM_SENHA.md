# 🔐 Configurar Autenticação SSH sem Senha

Este guia mostra como configurar autenticação por chave SSH para não precisar digitar senha toda vez que transferir arquivos ou conectar na VPS.

---

## 🎯 Opção 1: Usando OpenSSH no Windows (Recomendado)

### Passo 1: Verificar se OpenSSH está instalado

No PowerShell:

```powershell
ssh -V
```

Se não estiver instalado, instale:

```powershell
# No PowerShell como Administrador
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### Passo 2: Gerar Chave SSH

```powershell
# Gerar chave SSH (pressione Enter para usar localização padrão e deixar senha vazia)
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
```

**Localização padrão:** `C:\Users\SEU_USUARIO\.ssh\id_rsa`

### Passo 3: Copiar Chave para VPS

```powershell
# Substitua pelo IP e usuário da sua VPS
ssh-copy-id appuser@192.168.0.47
```

**Se `ssh-copy-id` não estiver disponível no Windows**, use este método alternativo:

```powershell
# No PowerShell
$publicKey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"
ssh appuser@192.168.0.47 "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

Você precisará digitar a senha uma última vez.

### Passo 4: Testar Conexão

```powershell
# Agora deve conectar sem pedir senha
ssh appuser@192.168.0.47
```

### Passo 5: Usar no Script de Transferência

```powershell
# Usar o script com a chave SSH
.\transferir-para-vps.ps1 -VpsIp "192.168.0.47" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"
```

---

## 🎯 Opção 2: Usando PuTTY (Alternativa)

Se preferir usar PuTTY:

### Passo 1: Instalar PuTTY

Baixe e instale: https://www.putty.org/

### Passo 2: Gerar Chave com PuTTYgen

1. Abra **PuTTYgen**
2. Clique em **Generate**
3. Mova o mouse para gerar aleatoriedade
4. Clique em **Save private key** (salve como `id_rsa.ppk`)
5. **Copie a chave pública** (texto na caixa superior)

### Passo 3: Copiar Chave para VPS

1. Conecte na VPS via PuTTY
2. Execute:

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
```

3. Cole a chave pública que copiou do PuTTYgen
4. Salve (`Ctrl+X`, `Y`, `Enter`)
5. Configure permissões:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Passo 4: Configurar PuTTY para Usar Chave

1. Abra PuTTY
2. Vá em **Connection > SSH > Auth**
3. Em **Private key file for authentication**, selecione o arquivo `id_rsa.ppk`
4. Vá em **Session**, salve a configuração
5. Conecte - não deve pedir senha

---

## 🎯 Opção 3: Usar WinSCP (Interface Gráfica)

### Passo 1: Instalar WinSCP

Baixe: https://winscp.net/

### Passo 2: Configurar Autenticação

1. Abra WinSCP
2. Configure:
   - **Host name:** `192.168.0.47`
   - **User name:** `appuser`
   - **Password:** sua senha
3. Clique em **Advanced > SSH > Authentication**
4. Em **Private key file**, selecione sua chave SSH
5. Clique em **OK** e depois **Login**

---

## 🔧 Solução de Problemas

### Erro: "Permission denied (publickey)"

**Causa:** Permissões incorretas na VPS

**Solução:**

```bash
# Na VPS, execute:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R appuser:appuser ~/.ssh
```

### Erro: "ssh-copy-id: command not found"

**Solução:** Use o método alternativo do Passo 3 acima.

### Erro: "Could not open a connection to your authentication agent"

**Solução no Windows:**

```powershell
# Iniciar agente SSH
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_rsa
```

### Chave não funciona após copiar

**Verificar na VPS:**

```bash
# Verificar se a chave foi copiada corretamente
cat ~/.ssh/authorized_keys

# Verificar permissões
ls -la ~/.ssh/
```

Deve mostrar:
```
drwx------  appuser appuser  .ssh
-rw-------  appuser appuser  authorized_keys
```

---

## 📝 Configuração Avançada: Arquivo SSH Config

Crie um arquivo `C:\Users\SEU_USUARIO\.ssh\config` para facilitar conexões:

```
Host vps-ctrldespesas
    HostName 192.168.0.47
    User appuser
    IdentityFile C:\Users\SEU_USUARIO\.ssh\id_rsa
    Port 22
```

Agora você pode conectar simplesmente com:

```powershell
ssh vps-ctrldespesas
```

---

## ✅ Checklist

- [ ] Chave SSH gerada
- [ ] Chave pública copiada para VPS
- [ ] Permissões configuradas corretamente na VPS
- [ ] Conexão testada sem senha
- [ ] Script de transferência configurado para usar chave

---

## 💡 Dicas de Segurança

1. **Nunca compartilhe sua chave privada** (`id_rsa`)
2. **Use senha na chave** se a VPS for acessível pela internet pública
3. **Desabilite login por senha** na VPS após configurar chave (opcional, avançado)
4. **Mantenha backups** da chave privada em local seguro

---

**✅ Pronto!** Agora você pode transferir arquivos sem digitar senha toda vez! 🚀
