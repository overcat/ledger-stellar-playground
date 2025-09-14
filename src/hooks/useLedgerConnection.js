import { useState, useCallback } from 'react'

export function useLedgerConnection() {
  const [transport, setTransport] = useState(null)
  const [str, setStr] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [transportType, setTransportType] = useState('webusb')
  const [error, setError] = useState(null)

  const connect = useCallback(async (preferredTransportType = 'webusb') => {
    try {
      setConnectionStatus('connecting')
      setError(null)

      let newTransport

      if (preferredTransportType === 'webusb') {
        const TransportWebUSB = await import('@ledgerhq/hw-transport-webusb')
        newTransport = await TransportWebUSB.default.create()
        setTransportType('webusb')
      } else {
        const TransportWebHID = await import('@ledgerhq/hw-transport-webhid')
        newTransport = await TransportWebHID.default.create()
        setTransportType('webhid')
      }

      // Import Stellar app
      const Str = await import('@ledgerhq/hw-app-str')
      const strApp = new Str.default(newTransport)

      setTransport(newTransport)
      setStr(strApp)
      setConnectionStatus('connected')

      return { transport: newTransport, str: strApp }
    } catch (err) {
      setConnectionStatus('error')
      setError(err.message)
      throw err
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      if (transport) {
        await transport.close()
      }
      setTransport(null)
      setStr(null)
      setConnectionStatus('disconnected')
      setTransportType('webusb')
      setError(null)
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }, [transport])

  return {
    transport,
    str,
    connectionStatus,
    transportType,
    error,
    connect,
    disconnect
  }
}