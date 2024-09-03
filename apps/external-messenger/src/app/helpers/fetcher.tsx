import axios from 'axios';
import { environment } from '../../../../../libs/shared/src/lib/config/environment';

export const fetcher = axios.create({
  baseURL: environment.baseUrl, 
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  withCredentials: true,
  // timeout: 1, // short timeout to test request failures
});

