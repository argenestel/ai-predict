import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, morphHolesky } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia, morphHolesky],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [morphHolesky.id]: http()
  },
})