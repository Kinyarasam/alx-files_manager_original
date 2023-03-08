#!/usr/bin/env bash
# Script to install redis client version 6.0.10

echo "Installing redis client server..."
wget http://download.redis.io/releases/redis-6.0.10.tar.gz
tar xzf redis-6.0.10.tar.gz
cd redis-6.0.10
make
cd ../
