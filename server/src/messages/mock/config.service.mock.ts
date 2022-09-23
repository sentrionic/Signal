export const mockConfigService = {
  get(key: string) {
    switch (key) {
      case 'AWS_STORAGE_BUCKET_NAME':
        return 'BUCKET';
      default: {
        return null;
      }
    }
  },
};
