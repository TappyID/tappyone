// Função helper para buscar UUID do contato pelo telefone
export async function getContactUUID(telefone: string): Promise<string | null> {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null

    const response = await fetch(`http://159.65.34.199:8081/api/contatos?telefone=${telefone}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {

      return null
    }

    const data = await response.json()

    // Tentar diferentes formatos de resposta
    let contato = null

    if (Array.isArray(data) && data.length > 0) {
      contato = data.find(c => c.numeroTelefone === telefone)
    } else if (data?.data && Array.isArray(data.data)) {
      contato = data.data.find(c => c.numeroTelefone === telefone)
    }

    if (contato?.id) {

      return contato.id
    }

    return null
  } catch {

    return null
  }
}
