import { useState, useCallback } from 'react'

export function useLedgerConnection() {
  const [transport, setTransport] = useState(null)
  const [str, setStr] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [transportType, setTransportType] = useState('webusb')
  const [error, setError] = useState(null)

  const connect = useCallback(async (preferredTransportType = 'webusb') => {
    console.log('Starting connection process...')

    // Reset state
    setConnectionStatus('connecting')
    setError(null)

    try {
      let newTransport

      if (preferredTransportType === 'webusb') {
        console.log('Attempting WebUSB connection...')
        try {
          const TransportWebUSB = await import('@ledgerhq/hw-transport-webusb')
          console.log('WebUSB module loaded, creating transport...')
          newTransport = await TransportWebUSB.default.create()
          console.log('WebUSB transport created successfully')
          setTransportType('webusb')
        } catch (webUsbError) {
          console.error('WebUSB creation failed:', webUsbError)
          throw webUsbError
        }
      } else {
        console.log('Attempting WebHID connection...')
        try {
          const TransportWebHID = await import('@ledgerhq/hw-transport-webhid')
          console.log('WebHID module loaded, creating transport...')
          newTransport = await TransportWebHID.default.create()
          console.log('WebHID transport created successfully')
          setTransportType('webhid')
        } catch (webHidError) {
          console.error('WebHID creation failed:', webHidError)
          throw webHidError
        }
      }

      // Import Stellar app
      console.log('Initializing Stellar app...')
      try {
        const Str = await import('@ledgerhq/hw-app-str')
        const strApp = new Str.default(newTransport)

        setTransport(newTransport)
        setStr(strApp)
        setConnectionStatus('connected')
        console.log('Connection successful')

        return { transport: newTransport, str: strApp }
      } catch (stellarError) {
        console.error('Stellar app initialization failed:', stellarError)
        throw stellarError
      }
    } catch (err) {
      console.error('Connection process failed, updating state:', err)
      setConnectionStatus('error')
      setError(err.message || err.toString() || 'Unknown connection error')
      console.log('State updated to error, throwing exception')
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