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
    const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
    const scriptUrl = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const scriptId = 'midtrans-snap-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = scriptUrl
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
      const ticketCode = res.data?.data?.ticketCode || res.data?.ticketCode

      if (window.snap && snapToken && !snapToken.startsWith('snap-fallback')) {
        window.snap.pay(snapToken, {
          onSuccess: async () => {
            try {
              await api.post('/orders/verify', { ticketCode })
            } catch (verifyErr) {
              console.error(verifyErr)
            }
            navigate('/my-tickets')
          },
          onPending: async () => {
            try {
              await api.post('/orders/verify', { ticketCode })
            } catch (verifyErr) {
              console.error(verifyErr)
            }
            navigate('/my-tickets')
          },
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
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-800 mb-6 font-bold text-lg">Tidak ada tiket yang dipilih untuk checkout.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#7956DF] hover:bg-[#6845c5] text-white font-bold px-8 py-3 rounded-xl w-full transition-colors"
          >
            Pilih Konser
          </button>
        </div>
      </div>
    )
  }

  const totalPrice = (price || 0) * (quantity || 1)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8 animate-fade-slide-up">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-[#7956DF]/10 text-[#7956DF] flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Konfirmasi Pembayaran</h1>
            <p className="text-sm text-gray-500 font-medium">Gateway pembayaran resmi via Midtrans (QRIS, E-Wallet, VA)</p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm mb-6">
            {errorMessage}
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 space-y-4">
          <div className="flex justify-between items-start text-sm">
            <span className="text-gray-500 font-medium">Event</span>
            <span className="font-bold text-gray-900 text-right">{eventTitle || 'Konser Musik'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Kategori Tiket</span>
            <span className="font-bold text-[#7956DF] bg-[#7956DF]/10 px-3 py-1 rounded-lg">{categoryName || 'Tiket Masuk'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Jumlah</span>
            <span className="font-bold text-gray-900">{quantity} tiket</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Harga Satuan</span>
            <span className="font-bold text-gray-900">Rp {(price || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center mt-2">
            <span className="font-bold text-gray-900 text-lg">Total Pembayaran</span>
            <span className="text-2xl font-black text-[#7956DF]">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-[#7956DF] hover:bg-[#6845c5] text-white p-4 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Menghubungkan Midtrans...
            </>
          ) : (
            <>
              Bayar Sekarang
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Transaksi aman terlindungi oleh Midtrans Snap Payment Gateway
        </p>
      </div>
    </div>
  )
}
