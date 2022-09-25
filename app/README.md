# Signal - App

The mobile application using [Android Compose](https://developer.android.com/jetpack/compose).

## Stack
- [Jetpack Compose](https://developer.android.com/jetpack/compose) to create the views
- [Retrofit](https://square.github.io/retrofit/) for HTTP Requests
- [Android Room](https://developer.android.com/training/data-storage/room) as the cache
- [Hilt](https://developer.android.com/training/dependency-injection/hilt-android) for depencency injection
- [Detekt](https://detekt.dev/) for linting

## Project Setup

1. Install Android Studio
2. Open the `app` directory inside Android Studio
3. Sync the dependencies
4. Run the app

### Lint

```sh
gradlew detekt
gradlew lint
```
