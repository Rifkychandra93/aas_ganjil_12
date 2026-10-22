import { useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'
import api from '../../utils/api'

interface ScanResult {
    status: 'success' | 'error' | 'idle'
    message: string
    data?: {
        ticketCode: string
        customer: string
        event: string
        category?: string
    }
}

export default function ScannerContent() {
    const [scanResult, setScanResult] = useState<ScanResult>({ status: 'idle', message: '' })
    const [isScanning, setIsScanning] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [manualCode, setManualCode] = useState('')

    const validateTicket = async (code: string) => {
        if (!code || isLoading) return
        setIsScanning(false)
        setIsLoading(true)
        setScanResult({ status: 'idle', message: 'Memvalidasi tiket...' })

        try {
            const res = await api.post('/tickets/scan', { qrCode: code })
            setScanResult({
                status: 'success',
                message: res.data?.message || 'Tiket Valid! Silakan Masuk.',
                data: res.data?.data,
            })
        } catch (error: any) {
            setScanResult({
                status: 'error',
                message: error.response?.data?.message || 'Tiket Tidak Valid / Sudah Digunakan!',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleScan = (_err: any, result: any) => {
        if (result && isScanning && !isLoading) {
            validateTicket(result.text)
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        validateTicket(manualCode.trim())
    }

    const resetScanner = () => {
        setScanResult({ status: 'idle', message: '' })
        setManualCode('')
        setIsScanning(true)
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Scanner Tiket Konser</h1>
                    <p className="text-xs text-gray-400 mt-1">Arahkan kamera ke QR Code atau Barcode pada tiket penonton</p>
                </div>

                <div className="w-full aspect-square bg-black rounded-xl overflow-hidden mb-6 relative border-4 border-gray-700 flex items-center justify-center">
                    {isScanning ? (
                        <BarcodeScannerComponent
                            width="100%"
                            height="100%"
                            onUpdate={handleScan}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900/95">
                            {scanResult.status === 'success' && (
                                <div className="text-emerald-400">
                                    <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xl font-extrabold">{scanResult.message}</p>
                                    {scanResult.data && (
                                        <div className="mt-4 p-3 bg-gray-800 rounded-lg text-left text-xs space-y-1 text-gray-300 border border-gray-700">
                                            <p><span className="text-gray-500">Kode:</span> <strong className="text-white">{scanResult.data.ticketCode}</strong></p>
                                            <p><span className="text-gray-500">Customer:</span> <strong className="text-white">{scanResult.data.customer}</strong></p>
                                            <p><span className="text-gray-500">Event:</span> <strong className="text-white">{scanResult.data.event}</strong></p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {scanResult.status === 'error' && (
                                <div className="text-rose-400">
                                    <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xl font-extrabold">{scanResult.message}</p>
                                </div>
                            )}
                            {scanResult.status === 'idle' && (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-300 font-medium">{scanResult.message}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!isScanning ? (
                    <button
                        onClick={resetScanner}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-lg shadow-blue-600/30"
                    >
                        Scan Tiket Berikutnya
                    </button>
                ) : (
                    <form onSubmit={handleManualSubmit} className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Input Kode Tiket manual (cth: TIX-...)"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                className="flex-1 bg-gray-900 border border-gray-700 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 font-mono"
                            />
                            <button
                                type="submit"
                                disabled={!manualCode.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
                            >
                                Periksa
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}