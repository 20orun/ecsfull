import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const missingCredentialsMessage = 'Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your environment and restart the dev server.';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const createDisabledResponse = ({ single = false, authData = null } = {}) => ({
  data: authData ?? (single ? null : []),
  error: { message: missingCredentialsMessage }
});

const createDisabledQuery = () => {
  const state = { single: false };

  const query = {
    select() {
      return query;
    },
    insert() {
      return query;
    },
    update() {
      return query;
    },
    delete() {
      return query;
    },
    upsert() {
      return query;
    },
    eq() {
      return query;
    },
    order() {
      return query;
    },
    range() {
      return query;
    },
    limit() {
      return query;
    },
    single() {
      state.single = true;
      return query;
    },
    then(resolve) {
      return Promise.resolve(createDisabledResponse({ single: state.single })).then(resolve);
    },
    catch(reject) {
      return Promise.resolve(createDisabledResponse({ single: state.single })).catch(reject);
    },
    finally(onFinally) {
      return Promise.resolve(createDisabledResponse({ single: state.single })).finally(onFinally);
    }
  };

  return query;
};

const createDisabledSupabaseClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: (callback) => {
      if (typeof callback === 'function') {
        callback('SIGNED_OUT', null);
      }

      return {
        data: {
          subscription: {
            unsubscribe() {}
          }
        }
      };
    },
    signInWithPassword: async () => createDisabledResponse(),
    signUp: async () => createDisabledResponse({ authData: { user: null, session: null } }),
    signOut: async () => ({ error: null })
  },
  from() {
    return createDisabledQuery();
  },
  rpc() {
    return Promise.resolve(createDisabledResponse());
  }
});

if (!isSupabaseConfigured) {
  console.warn(missingCredentialsMessage);
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDisabledSupabaseClient();

export const supabaseConfigErrorMessage = missingCredentialsMessage;
