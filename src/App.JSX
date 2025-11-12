import React, { useState } from 'react'

export default function App(){
  const [file, setFile] = useState(null)
  const [svg, setSvg] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleFile = (e) => {
    setFile(e.target.files?.[0] ?? null)
    setSvg('')
  }

  const handleSubmit = async () => {
    if(!file) return alert('Envie uma imagem')
    setProcessing(true)
    const fd = new FormData()
    fd.append('image', file)
    try{
      // If deployed behind a proxy, ensure the fetch goes to same origin.
      const url = typeof window !== 'undefined' && window.location.origin ? window.location.origin + '/api/vectorize' : '/api/vectorize'
      const res = await fetch(url, { method: 'POST', body: fd })
      if(!res.ok) throw new Error('Falha na vetorização')
      const text = await res.text()
      setSvg(text)
    }catch(err){
      alert('Erro: ' + err.message)
    }finally{
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Vetoriza Pro</h1>
        <p className="text-sm text-gray-600 mb-4">Upload uma imagem e gere um SVG de alta fidelidade.</p>

        <div className="mb-4">
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={handleSubmit} disabled={processing} className="px-4 py-2 bg-emerald-600 text-white rounded">
            {processing ? 'Processando...' : 'Vetorizar'}
          </button>
          <button onClick={() => { setFile(null); setSvg('') }} className="px-4 py-2 border rounded">Limpar</button>
        </div>

        <div className="border rounded p-3 min-h-[320px]">
          {svg ? (
            <div className="prose">
              <div dangerouslySetInnerHTML={{__html: svg}} />
            </div>
          ) : (
            <div className="text-gray-500">Sem SVG gerado ainda.</div>
          )}
        </div>

      </div>
    </div>
  )
}
