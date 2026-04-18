# Adapter — iOS (geplant, Post-Phase-5)

> Zukunft: Juvantis-iOS-App zieht Produktlisten, Referenzwerte, Team-Infos aus Cortex-Web.
>
> Implementierung frühestens nach Phase 5, wenn Cortex-Web-Trunk stabil.

## Idee

- Swift-Package, das bei Build-Time aus `trunk/content/` liest
- Generiert Swift-Strukturen (Codable) aus Trunk-YAMLs
- Keine laufende Runtime-Verbindung, alles im App-Bundle

## Status

Platzhalter. Wird erst aktiv, wenn DHT-iOS-App Produktlisten braucht.
