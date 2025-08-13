export const SECURITY_TOKEN_1400_MODULAR_ABI = [
  { type: 'function', name: 'pause', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'unpause', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'setValidator', stateMutability: 'nonpayable', inputs: [{ name: 'v', type: 'address' }], outputs: [] },
  { type: 'function', name: 'canTransfer', stateMutability: 'view', inputs: [
      { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }, { name: 'partition', type: 'bytes32' },
    ], outputs: [{ type: 'bool' }, { type: 'bytes1' }, { type: 'bytes32' }] },
  { type: 'function', name: 'issueByPartition', stateMutability: 'nonpayable',
    inputs: [{ name: 'partition', type: 'bytes32' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'redeemByPartition', stateMutability: 'nonpayable',
    inputs: [{ name: 'partition', type: 'bytes32' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'transferByPartition', stateMutability: 'nonpayable',
    inputs: [{ name: 'partition', type: 'bytes32' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'data', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'controllerTransfer', stateMutability: 'nonpayable',
    inputs: [{ name: 'partition', type: 'bytes32' }, { name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'data', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'setDocument', stateMutability: 'nonpayable',
    inputs: [{ name: 'name', type: 'bytes32' }, { name: 'uri', type: 'string' }, { name: 'docHash', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'balanceOfByPartition', stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'partition', type: 'bytes32' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalSupplyByPartition', stateMutability: 'view',
    inputs: [{ name: 'partition', type: 'bytes32' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'documents', stateMutability: 'view',
    inputs: [{ name: 'name', type: 'bytes32' }],
    outputs: [{ type: 'string' }, { type: 'bytes32' }, { type: 'uint256' }] },
  { type: 'function', name: 'hasRole', stateMutability: 'view',
    inputs: [{ name: 'role', type: 'bytes32' }, { name: 'account', type: 'address' }],
    outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'CONTROLLER_ROLE', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'bytes32' }] }
] as const

export const KYC_REGISTRY_ABI = [
  { type: 'function', name: 'isWhitelisted', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'lockupUntil', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'setWhitelist', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'allowed', type: 'bool' }], outputs: [] },
  { type: 'function', name: 'setLockup', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'until', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'setCountryCode', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'code', type: 'uint16' }], outputs: [] },
] as const

export const TRANSFER_VALIDATOR_ABI = [
  { type: 'function', name: 'setRegistry', stateMutability: 'nonpayable', inputs: [{ name: 'registry', type: 'address' }], outputs: [] },
] as const
