# Neurofoam [![Continuous Integration](https://github.com/jameswilddev/neurofoam/workflows/Continuous%20Integration/badge.svg)](https://github.com/jameswilddev/neurofoam/actions) [![License](https://img.shields.io/github/license/jameswilddev/neurofoam.svg)](https://github.com/jameswilddev/neurofoam/blob/master/license) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2Fneurofoam.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2Fneurofoam?ref=badge_shield) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

## Overview

Neurofoam is an approach for making dead-simple applications which port easily (even to the Web) and have automatic concurrency control.  It is best suited to systems which have many disconnected "islands" of state, which are referred to as "bubbles", where the system as a whole becomes a "foam" of these "bubbles".

It was built for a single private project and is not designed for solving real-world problems.

## NPM packages

Name                                                               | Version                                                                                                                                     | Description                                                                                        
------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------
[@neurofoam/channel-node-http](@neurofoam/channel-node-http)       | [![0.0.2](https://img.shields.io/npm/v/@neurofoam/channel-node-http.svg)](https://www.npmjs.com/package/@neurofoam/channel-node-http)       | This package is no longer supported.                                                               
[@neurofoam/channel-ws](@neurofoam/channel-ws)                     | [![0.0.0](https://img.shields.io/npm/v/@neurofoam/channel-ws.svg)](https://www.npmjs.com/package/@neurofoam/channel-ws)                     | A Neurofoam channel implementation which works with the ws package to accept WebSocket connections.
[@neurofoam/command-line-helpers](@neurofoam/command-line-helpers) | [![0.0.1](https://img.shields.io/npm/v/@neurofoam/command-line-helpers.svg)](https://www.npmjs.com/package/@neurofoam/command-line-helpers) | Shared helpers for creating command-line executables.                                              
[@neurofoam/orchestrator](@neurofoam/orchestrator)                 | [![0.0.0](https://img.shields.io/npm/v/@neurofoam/orchestrator.svg)](https://www.npmjs.com/package/@neurofoam/orchestrator)                 | Connects a set of Neurofoam type implementations to handle an incoming request.                    
[@neurofoam/persistence-dynamodb](@neurofoam/persistence-dynamodb) | [![0.0.0](https://img.shields.io/npm/v/@neurofoam/persistence-dynamodb.svg)](https://www.npmjs.com/package/@neurofoam/persistence-dynamodb) | Persists Neurofoam events in a DynamoDB instance.                                                  
[@neurofoam/persistence-memory](@neurofoam/persistence-memory)     | [![0.0.0](https://img.shields.io/npm/v/@neurofoam/persistence-memory.svg)](https://www.npmjs.com/package/@neurofoam/persistence-memory)     | Persists Neurofoam events in a temporary, volatile in-memory store.                                
[@neurofoam/persistence-sqlite](@neurofoam/persistence-sqlite)     | [![0.0.0](https://img.shields.io/npm/v/@neurofoam/persistence-sqlite.svg)](https://www.npmjs.com/package/@neurofoam/persistence-sqlite)     | Persists Neurofoam events in a SQLite database.                                                    
[@neurofoam/types](@neurofoam/types)                               | [![0.0.17](https://img.shields.io/npm/v/@neurofoam/types.svg)](https://www.npmjs.com/package/@neurofoam/types)                              | Types used by Neurofoam applications and hosts.                                                    
[neurofoam](neurofoam)                                             | [![0.0.0](https://img.shields.io/npm/v/neurofoam.svg)](https://www.npmjs.com/package/neurofoam)                                             | This is a stub package.  You probably want a @neurofoam/* package instead.                         

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2Fneurofoam.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2Fneurofoam?ref=badge_large)
