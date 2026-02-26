# 📝 Notas da Instalação - Memórias Futuras

## ✅ Configurações Finais Funcionando

### Domínio Utilizado
- **Domínio:** `projmanager.com.br`
- **Configurado em:** `.env.local` → `NEXT_PUBLIC_DOMAIN=projmanager.com.br`

### Problemas Encontrados e Soluções

#### 1. Script `transferir-para-vps.ps1` com Problemas

**Problema:** O script automatizado não estava criando o ZIP corretamente, resultando em:
- Arquivos faltando após descompactação
- Estrutura de diretórios incorreta
- `package.json` ou `app/` não encontrados

**Solução:** Criar ZIP manualmente usando PowerShell ou interface gráfica do Windows.

**Guia:** Veja `ZIP_MANUAL.md` para instruções detalhadas.

#### 2. Método Manual Funcionou Perfeitamente

**Resultado:** Após criar o ZIP manualmente, tudo funcionou de primeira sem necessidade de análises de estrutura ou arquivos.

**Recomendação:** Sempre usar método manual para criar ZIP até que o script seja corrigido.

---

## 🔧 Processo de Instalação que Funcionou

### 1. Criar ZIP Manualmente (Windows)

```powershell
cd c:\Users\giratech02\Documents\CtrlDespesas\web-app

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = "web-app-$timestamp.zip"

Compress-Archive -Path `
    app,components,hooks,lib,public,types,*.json,*.js,*.ts,*.tsx `
    -DestinationPath $zipFile `
    -Force `
    -Exclude "node_modules","*.log",".next",".git","*.zip"
```

### 2. Transferir para VPS

```powershell
scp -i "$env:USERPROFILE\.ssh\id_rsa" "$zipFile" root@SEU_IP_VPS:/root/
```

### 3. Na VPS: Seguir Guia de Reinstalação

Seguir `REINSTALACAO_COMPLETA_VPS.md` a partir do Passo 6 (Descompactar).

---

## 📋 Checklist de Instalação Bem-Sucedida

- [x] ZIP criado manualmente
- [x] ZIP transferido para VPS
- [x] Arquivos descompactados corretamente
- [x] `.env.local` criado com domínio `projmanager.com.br`
- [x] `package.json` encontrado e válido
- [x] Diretório `app/` encontrado
- [x] Dependências instaladas (`npm install`)
- [x] Build concluído com sucesso (`npm run build`)
- [x] PM2 iniciado e funcionando
- [x] Aplicação acessível via Cloudflare Tunnel

---

## 🎯 Configurações Importantes

### Domínio
- **Produção:** `projmanager.com.br`
- **Configurado em:** `.env.local`

### Firebase
- **Projeto:** `controle-de-despesas-78687`
- **Credenciais:** Configuradas em `.env.local`

### VPS
- **Diretório:** `/var/www/ctrldespesas-web/web-app`
- **PM2:** Processo `ctrldespesas-web`
- **Porta:** `3000` (localhost)

---

## 💡 Lições Aprendidas

1. **ZIP Manual > Script Automatizado:** O método manual é mais confiável
2. **Verificar Estrutura:** Sempre verificar se `app/` e `package.json` estão no ZIP antes de transferir
3. **Domínio Correto:** Usar `projmanager.com.br` em vez de `giratech.com.br`
4. **Permissões:** Sempre corrigir permissões dos executáveis após copiar arquivos

---

## 🔄 Para Próximas Atualizações

1. Criar ZIP manualmente (método que funcionou)
2. Transferir para VPS
3. Seguir guia de atualização (`ATUALIZAR_VPS.md`)
4. Verificar logs do PM2 após atualização

---

**✅ Tudo funcionando perfeitamente após usar método manual para criar ZIP!**
