/**
 * Dubverse API client for making authenticated requests
 * This client uses the internal API proxy to securely handle API keys
 */

interface DubverseRequestOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
}

interface DubverseResponse<T = any> {
  data?: T;
  error?: string;
  details?: any;
}

export class DubverseClient {
  private baseUrl = "/api/dubverse";

  /**
   * Make a request to the Dubverse API through our secure proxy
   */
  async request<T = any>({
    endpoint,
    method = "POST",
    body,
  }: DubverseRequestOptions): Promise<DubverseResponse<T>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: method === "GET" ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          method === "GET"
            ? undefined
            : JSON.stringify({ endpoint, method, body }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || "Request failed",
          details: data.details,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: "Network error",
        details: error,
      };
    }
  }

  /**
   * Get available languages for translation
   */
  async getLanguages() {
    return this.request({
      endpoint: "/languages",
      method: "GET",
    });
  }

  /**
   * Create a new dubbing project
   */
  async createProject(projectData: {
    name: string;
    source_language: string;
    target_language: string;
    video_url?: string;
    audio_url?: string;
  }) {
    return this.request({
      endpoint: "/projects",
      method: "POST",
      body: projectData,
    });
  }

  /**
   * Get project status
   */
  async getProject(projectId: string) {
    return this.request({
      endpoint: `/projects/${projectId}`,
      method: "GET",
    });
  }

  /**
   * Start dubbing process
   */
  async startDubbing(
    projectId: string,
    options?: {
      voice_id?: string;
      speed?: number;
      pitch?: number;
    },
  ) {
    return this.request({
      endpoint: `/projects/${projectId}/dub`,
      method: "POST",
      body: options,
    });
  }

  /**
   * Get available voices for a language
   */
  async getVoices(languageCode: string) {
    return this.request({
      endpoint: `/voices?language=${languageCode}`,
      method: "GET",
    });
  }
}

// Export a singleton instance
export const dubverseClient = new DubverseClient();
