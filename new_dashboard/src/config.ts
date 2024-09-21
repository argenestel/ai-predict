import { http, createConfig } from 'wagmi'
import {  sepolia, morphHolesky } from 'wagmi/chains'

export const config = createConfig({
  chains: [ sepolia, morphHolesky],
  multiInjectedProviderDiscovery: false,

  transports: {
    [sepolia.id]: http(),
    [morphHolesky.id]: http()
  },
})