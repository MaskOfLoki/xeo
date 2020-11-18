let ENV;
if (ENVIRONMENT === 'production') {
  ENV = {
    REDIS_URL:
      'https://xcite1.azurewebsites.net/api/redis-s?code=UKUWmxb/gpjddKgGvV4MmZVFeliFDx3zoyh77/PsnsMwyDpEPD2V0g==',
    LEADERBOARD_URL:
      'https://xcite1.azurewebsites.net/api/leaderboards?code=1RawvUYheUytVVXPJNAXMGP5mUSLOwjTEUcmLFNkQ9ixc9eZvEjYVQ==',
    COUPONS_URL:
      'https://xcite1.azurewebsites.net/api/coupons?code=/QL1kTqK4oCFhvpCAxdwKWNy8GEgY4AxYnb1CD/vjXB3yUKfaUc75w==',
    ACTIONBOARD_FEED_URL:
      'https://xcite1.azurewebsites.net/api/actionboard-feed?code=SwOUuMlMk7gb9lhlRFgMYpPmZ6rordqq6gqlIqYWG421LTpBN8zflw==',
    TIMESERIES_URL:
      'https://xcite1.azurewebsites.net/api/timeseries?code=b8twi4rxVXC4uoyI78Iv5pRZycTWtWk9bdEWFQECZHzDdO3ayB4dWg==',
    XEO_FEED_URL:
      'https://xcite1.azurewebsites.net/api/xeo-feed?code=w3P8WZbGR9k7mIAUNI1eN3SLZ7HsOBepsLyal9alj5R0kamuAgKfTA==',
    ACTIONBOARDEXPORT_FEED_URL:
      'https://xcite1.azurewebsites.net/api/actionboardexport-feed?code=hoQjyyLLETBgMMB8L5dTGiGSciawaabKOvvS5sqo6sF6g9tw3kX0QQ==',
    CHANNEL_FEED_URL:
      'https://xcite1.azurewebsites.net/api/xeo-channel-feed?code=4GnCalnQHc2C6ovOU0ivUyaqPutRIMCtSK/yfa3akonU9XIS3uQWcw==',
    // both develop and prod environments use same wowza cloud account, so it's fine to have same url for both
    WOWZA_URL:
      'https://xcite-develop.azurewebsites.net/api/wowza?code=HKCWoFGKbumkdMFLKRpuOMMGiqNIRCKb//B1AudLVIcfv3MMNpeJ4Q==',
    // TODO: put correct url here after azure-functions master deployment
    SMS_URL:
      'https://xcite-develop.azurewebsites.net/api/sms?code=TQqQDyQI1P76yUScVa3TmQTHnd6uRMWE/zD4XP0a0XAe7P7Qju8AQw==',
    // TODO: put correct url here after azure-functions master deployment
    EMAIL_SERVICE_URL:
      'https://xcite-develop.azurewebsites.net/api/email?code=/BYfMhD5DxCxi3Xj3sUjGrme4haxbI3N5OUvn5H2kw5TaNFHZaYMtw==',
    // TODO: put correct url here after azure-functions master deployment
    USER_GROUP_URL:
      'https://xcite-develop.azurewebsites.net/api/user-groups?code=1lxRleTndFZshUTdX0p73RkY97aBw9rcwFfRKsIadWOm63Z43z8Vmg==',
    SNAPSHOTS_URL:
      'https://xcite-develop.azurewebsites.net/api/snapshots?code=nGz78P/88eDerHQFBeEM2ppbpItG5a4GZNcJ71f3jjV9GuFk3agUOw==',
  };
} else {
  ENV = {
    REDIS_URL:
      'https://xcite-develop.azurewebsites.net/api/redis-s?code=14ShadajVZM6nPGZ8N3ZjNKIc4O9Z2PkweaD54T4nWZ/aasdopG6bg==',
    LEADERBOARD_URL:
      'https://xcite-develop.azurewebsites.net/api/leaderboards?code=ohcg98AzaPuValN/VXZZTl9PmygM99Y53aaNum1LLVXiRv0ZbP2LKg==',
    COUPONS_URL:
      'https://xcite-develop.azurewebsites.net/api/coupons?code=LkDfcwKMu2CqoptPhjuQOJ6E4hampFaf56GDtqIlgl8Yrpa2E5ds/A==',
    ACTIONBOARD_FEED_URL:
      'https://xcite-develop.azurewebsites.net/api/actionboard-feed?code=EKEKVghMWSB0qMLUojqyhSLrr0e5KHNZ0dWAA2mUsjjPo4wdCAaf/g==',
    TIMESERIES_URL:
      'https://xcite-develop.azurewebsites.net/api/timeseries?code=qxMvYusamp7JQpzMk8Z9dZp8ATKob68rfkvHJDtJHxlWEH7V9roMSg==',
    XEO_FEED_URL:
      'https://xcite-develop.azurewebsites.net/api/xeo-feed?code=DoKeTqQEjUC3/ekevP10awzyYZ8aIwdE7zrS5NSBOCqiDgYXNzl2Bg==',
    ACTIONBOARDEXPORT_FEED_URL:
      'https://xcite-develop.azurewebsites.net/api/actionboardexport-feed?code=41qfJ/1NSFNHbHlIudbRs78cdlqEfya78EyBQBMNiUMFBJNU2fAdlA==',
    CHANNEL_FEED_URL:
      'https://xcite-develop.azurewebsites.net/api/xeo-channel-feed?code=OYPx5Hc/7NhiTrgQregrRqrapbPvYiNTSv6rFtDs6hKn1wrAb/LOJw==',
    WOWZA_URL:
      'https://xcite-develop.azurewebsites.net/api/wowza?code=HKCWoFGKbumkdMFLKRpuOMMGiqNIRCKb//B1AudLVIcfv3MMNpeJ4Q==',
    SMS_URL:
      'https://xcite-develop.azurewebsites.net/api/sms?code=TQqQDyQI1P76yUScVa3TmQTHnd6uRMWE/zD4XP0a0XAe7P7Qju8AQw==',
    EMAIL_SERVICE_URL:
      'https://xcite-develop.azurewebsites.net/api/email?code=/BYfMhD5DxCxi3Xj3sUjGrme4haxbI3N5OUvn5H2kw5TaNFHZaYMtw==',
    USER_GROUP_URL:
      'https://xcite-develop.azurewebsites.net/api/user-groups?code=1lxRleTndFZshUTdX0p73RkY97aBw9rcwFfRKsIadWOm63Z43z8Vmg==',
    SNAPSHOTS_URL:
      'https://xcite-develop.azurewebsites.net/api/snapshots?code=nGz78P/88eDerHQFBeEM2ppbpItG5a4GZNcJ71f3jjV9GuFk3agUOw==',
  };
}

export default ENV;
