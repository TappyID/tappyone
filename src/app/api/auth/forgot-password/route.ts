import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Armazenamento temporário dos códigos de reset (em produção, usar Redis ou banco)
const resetCodes = new Map<string, { code: string; expires: number }>()

// Funções auxiliares exportadas para uso no reset-password
export function validateResetCode(email: string, code: string): boolean {
  const storedData = resetCodes.get(email)
  if (!storedData) {
    return false
  }
  
  if (Date.now() > storedData.expires) {
    resetCodes.delete(email)
    return false
  }
  
  return storedData.code === code
}

export function consumeResetCode(email: string): void {
  resetCodes.delete(email)
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

    // Gerar código de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString()
    const expires = Date.now() + 15 * 60 * 1000 // 15 minutos

    // Armazenar código temporariamente
    resetCodes.set(email, { code: resetCode, expires })

    // Configurar transporter do email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Template HTML sofisticado TappyOne
    const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?code=${resetCode}&email=${encodeURIComponent(email)}`
    
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha - TappyOne CRM</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8eaf6 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #273155 0%, #1e2442 100%); padding: 40px 32px; text-align: center;">
          <div style="background: white; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 24px;">
            <div style="font-size: 24px; font-weight: bold; color: #273155; letter-spacing: -0.5px;">
              TappyOne CRM
            </div>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            Recuperação de Senha
          </h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
            Solicitação de redefinição de senha recebida
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, #273155 0%, #1e2442 100%); color: white; font-size: 32px; font-weight: 700; padding: 20px; border-radius: 16px; letter-spacing: 2px; margin-bottom: 16px; box-shadow: 0 8px 16px rgba(39, 49, 85, 0.2);">
              ${resetCode}
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Este código expira em <strong>15 minutos</strong>
            </p>
          </div>

          <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #273155;">
            <h3 style="color: #273155; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              🔐 Como redefinir sua senha:
            </h3>
            <ol style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Copie o código de 6 dígitos acima</li>
              <li>Clique no botão abaixo ou acesse o link</li>
              <li>Cole o código na página de redefinição</li>
              <li>Crie sua nova senha segura</li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${resetLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #273155 0%, #1e2442 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(39, 49, 85, 0.3); transition: all 0.3s ease;">
              🔓 Redefinir Minha Senha
            </a>
          </div>

          <div style="text-align: center; padding: 16px; background: #fef3c7; border-radius: 12px; border: 1px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
              ⚠️ <strong>Importante:</strong> Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
            Este email foi enviado pelo sistema <strong>TappyOne CRM</strong>
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
      from: `"TappyOne CRM" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🔐 Código de Recuperação de Senha - TappyOne CRM',
      html: htmlTemplate,
    })

    return NextResponse.json({
      message: 'Código de recuperação enviado com sucesso',
      email,
    })

  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
