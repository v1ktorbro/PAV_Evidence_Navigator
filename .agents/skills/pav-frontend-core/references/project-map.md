# Frontend project map

```text
frontend/src/
├── app/             screens and route-level composition
├── api/             REST transport functions
├── assets/types/    shared API/domain contracts
├── components/      reusable components
│   └── ui/          domain-agnostic primitives
└── styles/          global reset, tokens, mixins and media queries
```

The evidence screen owns filters, selection, data loading, local analysis and Synapse submission. `api/evidence.ts` is the only HTTP boundary for this domain.
