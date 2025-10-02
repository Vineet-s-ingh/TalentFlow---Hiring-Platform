// src/hooks/useSeedData.js
import { useEffect } from 'react'
import { db } from '../services/database'

export function useSeedData() {
  useEffect(() => {
    const seedData = async () => {
      try {
        await db.seedInitialData()
      } catch (error) {
        console.log('Seed data already exists or error:', error)
      }
    }

    seedData()
  }, [])
}