'use client'

import { useState } from 'react'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CashbackCalculator() {
  const [saldo, setSaldo] = useState('')
  const [compra, setCompra] = useState('')

  const saldoNum = parseFloat(saldo.replace(',', '.')) || 0
  const compraNum = parseFloat(compra.replace(',', '.')) || 0

  const maxLiberavel = compraNum * 0.3
  const valorLiberado = Math.min(saldoNum, maxLiberavel)
  const compraMinima = saldoNum > 0 ? saldoNum / 0.3 : 0
  const totalAPagar = compraNum - valorLiberado

  const podeLiberarTudo = compraNum >= compraMinima && saldoNum > 0

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Calculadora de Cashback</h1>
          <p className="text-gray-400 text-sm">Casa Renata Goiania</p>
        </div>

        {/* Card de inputs */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Saldo de Cashback do Cliente
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={saldo}
                  onChange={(e) => setSaldo(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-lg font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Valor da Compra
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={compra}
                  onChange={(e) => setCompra(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-lg font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resultado */}
        {(saldoNum > 0 || compraNum > 0) && (
          <div className="space-y-3">
            {/* Compra mínima */}
            {saldoNum > 0 && (
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Compra mínima para usar todo o cashback
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatBRL(compraMinima)}
                </p>
              </div>
            )}

            {/* Cashback liberado */}
            {compraNum > 0 && saldoNum > 0 && (
              <>
                <div className={`rounded-2xl p-5 border ${podeLiberarTudo ? 'bg-emerald-950 border-emerald-700' : 'bg-gray-900 border-gray-800'}`}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Cashback que pode ser usado
                  </p>
                  <p className={`text-3xl font-bold ${podeLiberarTudo ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {formatBRL(valorLiberado)}
                  </p>
                  {podeLiberarTudo ? (
                    <p className="text-emerald-500 text-xs mt-1 font-medium">Todo o saldo liberado</p>
                  ) : (
                    <p className="text-gray-500 text-xs mt-1">
                      30% de {formatBRL(compraNum)} — saldo restante: {formatBRL(saldoNum - valorLiberado)}
                    </p>
                  )}
                </div>

                <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Total a pagar pelo cliente
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {formatBRL(totalAPagar)}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Estado vazio */}
        {saldoNum === 0 && compraNum === 0 && (
          <div className="text-center py-6 text-gray-600 text-sm">
            Preencha os campos acima para calcular
          </div>
        )}

        <p className="text-center text-gray-700 text-xs mt-6">
          Regra: cashback limitado a 30% do valor da compra
        </p>
      </div>
    </div>
  )
}
