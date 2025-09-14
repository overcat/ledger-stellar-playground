import { useState, useCallback } from 'react'

export function useLedgerConnection() {
  const [transport, setTransport] = useState(null)
  const [str, setStr] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [transportType, setTransportType] = useState('webusb')

  const connect = useCallback(async (preferredTransportType = 'webusb') => {
    try {
      setConnectionStatus('connecting')

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
    } catch (error) {
      setConnectionStatus('error')
      throw new Error(`Connection failed: ${error.message}`)
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
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }, [transport])

  return {
    transport,
    str,
    connectionStatus,
    transportType,
    connect,
    disconnect
  }
}