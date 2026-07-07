// Gmail API Client helpers using the OAuth Access Token

export interface GmailMessage {
  id: string;
  threadId: string;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessageDetail {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: GmailHeader[];
    body?: {
      size: number;
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body?: {
        size: number;
        data?: string;
      };
      parts?: any[];
    }>;
  };
}

export interface ParsedEmail {
  id: string;
  threadId: string;
  snippet: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  body: string;
}

/**
 * Base64url helper decodes Gmail's custom safe-url base64 encoding to clean HTML/text
 */
export function decodeGmailBody(str: string): string {
  if (!str) return '';
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(base64);
    } catch (err) {
      return 'Failed to safely parse mail content.';
    }
  }
}

/**
 * Traverses Gmail's multi-part structure to retrieve the best available message body (HTML preferred over plain text)
 */
export function extractBody(payload: any): string {
  if (!payload) return '';
  
  // 1. Direct body
  if (payload.body && payload.body.data) {
    return decodeGmailBody(payload.body.data);
  }

  // 2. Parts
  if (payload.parts && payload.parts.length > 0) {
    // Look for text/html first
    const htmlPart = payload.parts.find((part: any) => part.mimeType === 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      return decodeGmailBody(htmlPart.body.data);
    }

    // Fallback to text/plain
    const textPart = payload.parts.find((part: any) => part.mimeType === 'text/plain');
    if (textPart && textPart.body && textPart.body.data) {
      return `<pre style="font-family: inherit; white-space: pre-wrap;">${decodeGmailBody(textPart.body.data)}</pre>`;
    }

    // Nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const nestedBody = extractBody(part);
        if (nestedBody) return nestedBody;
      }
    }
  }

  return '';
}

/**
 * Extract specific header value
 */
export function getHeader(headers: GmailHeader[], name: string): string {
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : '';
}

/**
 * Fetches list of email messages
 */
export async function listMessages(accessToken: string, query = '', maxResults = 15): Promise<GmailMessage[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  if (query) url.searchParams.append('q', query);
  url.searchParams.append('maxResults', String(maxResults));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API error (${res.status})`);
  }

  const data = await res.json();
  return data.messages || [];
}

/**
 * Fetches detail of a single email message
 */
export async function getMessageDetails(accessToken: string, id: string): Promise<ParsedEmail> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to retrieve mail ID: ${id}`);
  }

  const data: GmailMessageDetail = await res.json();
  const headers = data.payload.headers;

  const subject = getHeader(headers, 'subject') || '(No Subject)';
  const from = getHeader(headers, 'from') || 'Unknown Sender';
  const to = getHeader(headers, 'to') || 'Me';
  const dateStr = getHeader(headers, 'date') || '';
  const body = extractBody(data.payload);

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet,
    date: dateStr,
    from,
    to,
    subject,
    body: body || data.snippet || '(Empty Body)',
  };
}

/**
 * Sends a real email using Gmail API
 */
export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  bodyHtml: string
): Promise<{ id: string }> {
  // Construct a standard RFC 822 raw MIME message format
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    bodyHtml,
  ];

  const rawMime = btoa(unescape(encodeURIComponent(emailLines.join('\r\n'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawMime }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to dispatch email via Gmail API.');
  }

  return res.json();
}

/**
 * Creates an email draft using Gmail API
 */
export async function createDraft(
  accessToken: string,
  to: string,
  subject: string,
  bodyHtml: string
): Promise<{ id: string }> {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    bodyHtml,
  ];

  const rawMime = btoa(unescape(encodeURIComponent(emailLines.join('\r\n'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        raw: rawMime,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create Gmail draft.');
  }

  return res.json();
}
