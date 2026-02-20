/**
 * Admin System Health Check Controller
 * Monitors system resources and database health
 */

import { Request, Response } from 'express';
import os from 'os';
import { pool } from '../config/database.js';
import { SystemHealth } from '../types/index.js';

/**
 * Get system health status
 */
export async function getSystemHealth(req: Request, res: Response) {
  try {
    // Get RAM info
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

    // Get CPU info
    const cpus = os.cpus();
    const cpuUsage = calculateCpuUsage();

    // Get system uptime (in seconds)
    const uptime = os.uptime();

    // Check database connection
    let dbStatus = 'disconnected';
    let poolSize = 0;
    try {
      const result = await pool.query('SELECT NOW() as timestamp');
      if (result.rows.length > 0) {
        dbStatus = 'connected';
        poolSize = pool.totalCount;
      }
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Determine overall health status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (memoryPercentage > 85 || cpuUsage > 80 || dbStatus === 'disconnected') {
      status = 'critical';
    } else if (memoryPercentage > 70 || cpuUsage > 60) {
      status = 'warning';
    }

    const health: SystemHealth = {
      status,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus as 'connected' | 'disconnected',
        poolSize,
        activeConnections: pool.activeCount || 0
      },
      system: {
        ram: {
          total: Math.round(totalMemory / 1024 / 1024),
          used: Math.round(usedMemory / 1024 / 1024),
          free: Math.round(freeMemory / 1024 / 1024),
          percentage: memoryPercentage
        },
        cpu: {
          cores: cpus.length,
          usage: cpuUsage
        },
        uptime: Math.round(uptime)
      }
    };

    res.json(health);
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification de la santé du système',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Calculate CPU usage percentage
 */
function calculateCpuUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);

  return Math.min(usage, 100);
}

/**
 * Get detailed service status
 */
export async function getServiceStatus(req: Request, res: Response) {
  try {
    const services = {
      database: 'unknown',
      redis: 'unknown',
      api: 'healthy'
    };

    // Check database
    try {
      await pool.query('SELECT 1');
      services.database = 'healthy';
    } catch {
      services.database = 'unhealthy';
    }

    // TODO: Add Redis check if using Redis
    services.redis = 'not_configured';

    res.json({
      timestamp: new Date().toISOString(),
      services
    });
  } catch (error) {
    console.error('Error getting service status:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des services' });
  }
}

/**
 * Get application metrics
 */
export async function getApplicationMetrics(req: Request, res: Response) {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      env: process.env.NODE_ENV || 'development'
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métriques' });
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(req: Request, res: Response) {
  try {
    // Get table sizes
    const tableSizesResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    // Get row counts
    const countResult = await pool.query(`
      SELECT schemaname, tablename, n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
    `);

    // Get active connections
    const connectionsResult = await pool.query(`
      SELECT count(*) as active_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    // Get index info
    const indexResult = await pool.query(`
      SELECT 
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(idx)) as size
      FROM pg_indexes
      JOIN pg_class idx ON (idx.relname = indexname)
      WHERE schemaname = 'public'
      ORDER BY pg_relation_size(idx) DESC
    `);

    res.json({
      timestamp: new Date().toISOString(),
      tables: tableSizesResult.rows,
      row_counts: countResult.rows,
      active_connections: connectionsResult.rows[0]?.active_connections || 0,
      indexes: indexResult.rows
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
}

/**
 * Liveness probe (for container/load balancer)
 */
export async function livenessProbe(req: Request, res: Response) {
  try {
    // Simple check that the service is running
    res.json({ status: 'alive', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'dead', error: 'Service unavailable' });
  }
}

/**
 * Readiness probe (for container/load balancer)
 */
export async function readinessProbe(req: Request, res: Response) {
  try {
    // Check database connectivity
    await pool.query('SELECT 1');
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: 'Database unavailable' });
  }
}
