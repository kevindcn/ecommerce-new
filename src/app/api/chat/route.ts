import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Kamu adalah URBI, asisten virtual toko fashion URBANE.

Produk: Footwear, Apparel, Bags, Accessories
Pengiriman: JNE Reguler (2-3hr, Rp25rb), JNE YES (1-2hr, Rp45rb), SiCepat (2-3hr, Rp22rb)
Gratis ongkir >Rp500rb. Return 30 hari. Produk original bergaransi.

Promo: URBANE10 (diskon 10%), URBANE25 (cashback Rp25rb member baru), Flash Sale s/d 40%

Produk unggulan:
- Sneakers Urban Pro X1: Rp899rb (dari Rp1.299rb) ⭐4.8
- Hoodie Oversized Essential: Rp459rb (dari Rp599rb) ⭐4.6
- Tas Ransel Laptop: Rp649rb ⭐4.9
- Jam Tangan Analog: Rp799rb ⭐4.8
- Kacamata Pilot Polarized: Rp329rb ⭐4.7
- Celana Cargo Utility: Rp529rb (dari Rp699rb) ⭐4.5

Ukuran baju: XS=80-84cm, S=84-88cm, M=88-92cm, L=92-96cm, XL=96-100cm
Ukuran sepatu: 39=24.5cm, 40=25cm, 41=25.5cm, 42=26cm, 43=26.5cm, 44=27cm
Lacak pesanan: klik ikon Pesanan di navbar.

Jawab bahasa Indonesia, santai, pakai emoji, singkat dan padat.`

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY tidak ditemukan')
      return NextResponse.json({ error: 'API key tidak dikonfigurasi' }, { status: 500 })
    }

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Pesan user tidak ditemukan' }, { status: 400 })
    }

    // Format messages — filter hanya user & assistant
    const allMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role,
        content: m.content,
      }))

    // Pastikan dimulai dari user
    const firstUserIdx = allMessages.findIndex((m: any) => m.role === 'user')
    const validMessages = firstUserIdx === -1
      ? [{ role: 'user', content: lastMessage.content }]
      : allMessages.slice(firstUserIdx).slice(-10) // maks 10 pesan terakhir

    console.log('✅ GROQ_API_KEY:', apiKey.slice(0, 8) + '...')
    console.log('📨 Messages dikirim:', validMessages.length)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // gratis, cepat, works di Indonesia
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...validMessages,
        ],
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      console.error('Groq error:', errData)
      throw new Error(errData?.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    console.log('✅ Respons OK, panjang:', text.length)
    return NextResponse.json({ message: text })

  } catch (error: any) {
    console.error('=== ERROR ===')
    console.error('Message:', error?.message)
    console.error('=============')

    return NextResponse.json(
      { error: `Gagal: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}