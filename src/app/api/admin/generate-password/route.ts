import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Lista de emails de administradores autorizados
const ADMIN_EMAILS = [
  'willian@crm.tappy.id',
  'rodrigo@crm.tappy.id',
  'admin@crm.tappy.id',
  'willian@tappy.id',
  'rodrigo@tappy.id',
  'admin@tappy.id',
  'contato@vyzer.com.br'
]

function generateStrongPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se é um email de admin autorizado
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Email não autorizado para recuperação administrativa' },
        { status: 403 }
      )
    }

    // Gerar nova senha forte
    const newPassword = generateStrongPassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha no banco via backend
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/generate-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        senha: hashedPassword,
      }),
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.text()
      return NextResponse.json(
        { error: 'Erro ao atualizar senha no servidor' },
        { status: 500 }
      )
    }

    // Tentar enviar email (opcional - não bloquear se falhar)
    let emailSent = false
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      })

      // Template HTML para admin recovery
      const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Senha de Administrador - TappyOne CRM</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 32px; text-align: center;">
          <div style="background: white; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 24px;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626; letter-spacing: -0.5px;">
              TappyOne CRM
            </div>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            🔑 Nova Senha de Admin
          </h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
            Senha gerada automaticamente pelo sistema
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; font-size: 20px; font-weight: 700; padding: 20px; border-radius: 16px; letter-spacing: 1px; margin-bottom: 16px; box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2); font-family: 'Courier New', monospace;">
              ${newPassword}
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              ⚠️ <strong>Altere esta senha após o primeiro login</strong>
            </p>
          </div>

          <div style="background: #fef3c7; border-radius: 16px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              🛡️ Instruções de Segurança:
            </h3>
            <ol style="color: #78350f; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Use esta senha para fazer login imediatamente</li>
              <li>Altere para uma senha pessoal após o login</li>
              <li>Nunca compartilhe suas credenciais</li>
              <li>Esta senha foi gerada automaticamente</li>
            </ol>
          </div>

          <div style="text-align: center; padding: 16px; background: #fecaca; border-radius: 12px; border: 1px solid #f87171;">
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; font-weight: 500;">
              🔐 <strong>Acesso Administrativo:</strong> Este email foi enviado porque uma nova senha foi solicitada para um administrador do sistema TappyOne CRM.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
            Este email foi enviado pelo <strong>Sistema Admin Recovery - TappyOne CRM</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 TappyOne CRM. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
    `

      // Enviar email
      await transporter.sendMail({
        from: `"TappyOne CRM - Admin Recovery" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: '🔑 Nova Senha de Administrador - TappyOne CRM',
        html: htmlTemplate,
      })
      
      emailSent = true
      console.log('✅ Email de recuperação enviado com sucesso')
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email (não crítico):', emailError)
      // Não bloquear - a senha já foi gerada e salva
    }

    // Retornar sucesso mesmo se email falhar
    return NextResponse.json({
      message: emailSent 
        ? 'Nova senha gerada e enviada por email com sucesso' 
        : 'Nova senha gerada com sucesso (email não enviado - verifique na tela)',
      email,
      newPassword: newPassword, // Sempre retorna na resposta para exibir na tela
      emailSent,
    })

  } catch (error) {
    console.error('Erro ao gerar senha de admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
