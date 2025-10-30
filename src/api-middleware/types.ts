import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware Types
 *
 * Type definitions for the composable middleware system.
 * Provides type-safe middleware composition for Next.js API routes.
 */

/**
 * Context object passed through middleware chain
 * Each middleware can add properties to this object
 */
export interface MiddlewareContext {
  request: NextRequest
  validated?: any // Data from validation middleware
  user?: any // User from auth middleware
  startTime?: number // Start time from logging middleware
  [key: string]: any // Allow additional custom properties
}

/**
 * Handler function that processes the request
 * Receives the context with all middleware additions
 */
export type RouteHandler<T = any> = (
  req: NextRequest,
  context: MiddlewareContext
) => Promise<NextResponse | T>

/**
 * Middleware function that wraps a handler
 * Can modify context, handle errors, or transform the response
 */
export type Middleware = (
  handler: RouteHandler,
  context: MiddlewareContext
) => Promise<NextResponse>

/**
 * Result from a handler (can be NextResponse or plain data)
 */
export type HandlerResult<T = any> = NextResponse | T
