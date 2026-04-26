const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

    try {
      const { amount, nome, email, telefone, cpf } = await request.json()

      const identifier = 'doacao_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

      let phone = (telefone || '11999999999').replace(/\D/g, '')
      if (!phone.startsWith('55')) phone = '55' + phone
      phone = '+' + phone

      const client = {
        name: nome || 'Doador',
        email: email || 'deoracoes@irmaos.com.br',
        phone
      }
      if (cpf) client.document = cpf.replace(/\D/g, '')

      const payload = {
        identifier,
        amount: parseFloat(amount),
        client,
        products: [{ id: 'doacao', name: 'Versículo Diário Irmãos de Oração', quantity: 1, price: parseFloat(amount) }],
        metadata: { provider: 'Site', type: 'doacao' }
      }

      const resp = await fetch('https://app.amplopay.com/api/v1/gateway/pix/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-public-key': 'deoracoesirmaos_q45qbb3hpdqxbo86',
          'x-secret-key': 'ym4zgf670vkrpe0t1nzv1wrm1yylgqouh1amnvsko0w63qdfjxn66emd5ykij2t7'
        },
        body: JSON.stringify(payload)
      })

      const data = await resp.json()
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { ...CORS, 'Content-Type': 'application/json' }
      })

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    }
  }
}
