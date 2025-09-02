// Utilitário para testar sons de notificação
export const testNotificationSounds = () => {
  console.log('🔔 Testando sons de notificação...')
  
  // Teste do som de mensagem recebida
  const testIncomingSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Som de notificação do WhatsApp (simulado)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      console.log('✅ Som de mensagem recebida tocado!')
    } catch (error) {
      console.error('❌ Erro ao tocar som de mensagem recebida:', error)
    }
  }
  
  // Teste do som de mensagem enviada
  const testSentSound = () => {
    setTimeout(() => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Som mais suave para mensagem enviada
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.15)
        
        console.log('✅ Som de mensagem enviada tocado!')
      } catch (error) {
        console.error('❌ Erro ao tocar som de mensagem enviada:', error)
      }
    }, 1000)
  }
  
  testIncomingSound()
  testSentSound()
}

// Para testar no console do navegador:
// import { testNotificationSounds } from '@/utils/testSound'
// testNotificationSounds()
