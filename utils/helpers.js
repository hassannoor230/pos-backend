/**
 * Send standardized API response
 */
const sendResponse = (res, statusCode, success, message, data = null, extra = {}) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  Object.assign(response, extra);
  return res.status(statusCode).json(response);
};

/**
 * Build mongoose filter from query params
 */
const buildFilter = (query, allowedFields) => {
  const filter = {};
  allowedFields.forEach(field => {
    if (query[field] !== undefined) filter[field] = query[field];
  });
  return filter;
};

/**
 * Paginate query
 */
const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { sendResponse, buildFilter, paginate };
