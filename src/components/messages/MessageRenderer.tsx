import LocationMessageComponent from './LocationMessageComponent'
import PollMessageComponent from './PollMessageComponent'
import ContactMessageComponent from './ContactMessageComponent'
import DocumentMessageComponent from './DocumentMessageComponent'

interface MessageRendererProps {
  message: any
  sender: 'agent' | 'user'
}

export default function MessageRenderer({ message, sender }: MessageRendererProps) {
  // 1. Tentar Location
  const isLocation = message.type === 'location' || message.location || message.latitude || message.longitude
  if (isLocation) {
    return <LocationMessageComponent message={message} sender={sender} />
  }

  // 2. Tentar Poll
  const isPoll = message.type === 'poll' || message.poll || message.pollData ||
    (message.content && message.content.toLowerCase().includes('enquete'))
  if (isPoll) {
    return <PollMessageComponent message={message} sender={sender} />
  }

  // 3. Tentar Contact
  const isContact = message.type === 'contact' || message.type === 'vcard' || message.contact || message.vcard ||
    (message.content && message.content.includes('BEGIN:VCARD'))
  if (isContact) {
    return <ContactMessageComponent message={message} sender={sender} />
  }

  // 4. Tentar Document
  const isDocument = (message.type === 'document' || message.type === 'file') || 
    message.mimetype?.includes('application/') || 
    message.mediaUrl?.match(/\.(pdf|doc|docx|txt|xlsx|zip)$/i)
  if (isDocument && message.mediaUrl) {
    return <DocumentMessageComponent message={message} sender={sender} />
  }

  // 5. Se não é nenhum tipo específico, retorna null
  return null
}
