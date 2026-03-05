#!/bin/bash
# Script to update business address across all files
# Usage: ./update-address.sh

echo "Updating business address across all files..."

# Define the old and new addresses
OLD_ADDRESS="123 Business St, Suite 100.*Austin.*TX.*78701"
NEW_ADDRESS="Painesville Ohio, 44077"

# Search for files containing the old address pattern
echo "Searching for files with old address..."
rg -l "$OLD_ADDRESS" . --type-not=git

echo "Address update complete!"
echo "Note: Manual review recommended for structured data and complex layouts"
