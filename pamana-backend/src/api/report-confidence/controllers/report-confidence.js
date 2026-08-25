'use strict';

/**
 * report-confidence controller
 *
 * Stage 12.4 basic confidence logic: aggregates recent passenger reports
 * for a route (optionally scoped to one stop) into a simple confidence
 * signal. Only reports within RECENCY_WINDOW_MINUTES count - crowdsourced
 * conditions (a full jeep, a blocked route) go stale fast. Thresholds are
 * a placeholder heuristic, not an AI model - Phase 14+ predictions will
 * eventually supersede/inform this.
 */

const RECENCY_WINDOW_MINUTES = 15;

const confidenceLevelFor = (count) => {
  if (count >= 3) return 'high';
  if (count === 2) return 'medium';
  if (count === 1) return 'low';
  return 'none';
};

module.exports = {
  async list(ctx) {
    const { route, stop } = ctx.query;

    if (!route) {
      return ctx.badRequest('"route" query parameter is required.');
    }

    const windowStart = new Date(Date.now() - RECENCY_WINDOW_MINUTES * 60 * 1000).toISOString();

    const filters = {
      route: { documentId: route },
      reported_at: { $gte: windowStart },
    };

    if (stop) {
      filters.stop = { documentId: stop };
    }

    const reports = await strapi.documents('api::passenger-report.passenger-report').findMany({
      filters,
      sort: ['reported_at:desc'],
    });

    const counts = reports.reduce((acc, report) => {
      acc[report.report_type] = (acc[report.report_type] || 0) + 1;
      return acc;
    }, {});

    let dominant_report_type = null;
    let dominant_count = 0;

    for (const [type, count] of Object.entries(counts)) {
      if (count > dominant_count) {
        dominant_report_type = type;
        dominant_count = count;
      }
    }

    ctx.body = {
      data: {
        route,
        stop: stop || null,
        window_minutes: RECENCY_WINDOW_MINUTES,
        total_reports: reports.length,
        counts,
        dominant_report_type,
        confidence_level: confidenceLevelFor(dominant_count),
        latest_reported_at: reports[0]?.reported_at || null,
      },
    };
  },
};
