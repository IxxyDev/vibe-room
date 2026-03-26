import type { Metadata } from 'next'
import { RootLayout } from '@payloadcms/next/layouts'
import configPromise from '@payload-config'
import React from 'react'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Vibe Room Admin',
}

const Layout = ({ children }: Args) => (
  <RootLayout config={configPromise}>{children}</RootLayout>
)

export default Layout
