import { Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../src/middleware/auth';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should return 401 if no API key is provided', () => {
    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'API key is required',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if API key is invalid', () => {
    mockReq.headers = {
      authorization: 'Bearer invalid-key',
    };

    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next if API key is valid (Bearer token)', () => {
    mockReq.headers = {
      authorization: 'Bearer test-api-key',
    };

    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.apiKey).toBe('test-api-key');
  });

  it('should call next if API key is valid (x-api-key header)', () => {
    mockReq.headers = {
      'x-api-key': 'test-api-key',
    };

    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.apiKey).toBe('test-api-key');
  });
});
