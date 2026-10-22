import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../utils/api'

declare global {
  interface Window {
    snap: any
  }
}

export default function CheckoutContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { eventId, categoryId, quantity, price, eventTitle, categoryName } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-3T9RtG6iAKY7ueD1'
    const scriptId = 'midtrans-snap-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', clientKey)
      document.body.appendChild(script)
    }
  }, [])

  const handlePay = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await api.post('/orders', {
        eventId,
        categoryId,
        quantity,
      })

      const snapToken = res.data?.snapToken || res.data?.data?.snapToken

      if (window.snap && snapToken && !snapToken.startsWith('snap-fallback')) {
        window.snap.pay(snapToken, {
          onSuccess: () => navigate('/my-tickets'),
          onPending: () => navigate('/my-tickets'),
          onError: () => {
            alert('Pembayaran Midtrans gagal atau dibatalkan.')
            navigate('/my-tickets')
          },
          onClose: () => {
            navigate('/my-tickets')
          },
        })
      } else {
        navigate('/my-tickets')
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Gagal memproses pesanan tiket')
    } finally {
      setLoading(false)
    }
  }

  if (!categoryId || !quantity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <p className="text-gray-600 mb-4 font-medium">Tidak ada tiket yang dipilih untuk checkout.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
          >
            Pilih Konser
          </button>
        </div>
      </div>
    )
  }

  const totalPrice = (price || 0) * (quantity || 1)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Konfirmasi Pembayaran</h1>
            <p className="text-xs text-gray-500">Gateway pembayaran resmi via Midtrans</p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Event</span>
            <span className="font-semibold text-gray-900">{eventTitle || 'Konser Musik'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Kategori Tiket</span>
            <span className="font-semibold text-gray-900">{categoryName || 'Tiket Masuk'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Jumlah</span>
            <span className="font-semibold text-gray-900">{quantity} tiket</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Harga Satuan</span>
            <span className="font-semibold text-gray-900">Rp {(price || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total Pembayaran</span>
            <span className="text-xl font-black text-blue-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Menghubungkan Midtrans...
            </>
          ) : (
            'Bayar Sekarang dengan Midtrans'
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Transaksi aman terlindungi oleh Midtrans Snap Payment Gateway
        </p>
      </div>
    </div>
  )
}