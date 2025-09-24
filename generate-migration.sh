#!/bin/bash

# This script handles the interactive prompts for drizzle-kit generate
# It always selects the first option (create column) for all prompts

# Use expect if available, otherwise use printf
if command -v expect &> /dev/null; then
    expect -c '
        spawn pnpm db:generate
        expect {
            "Is * column in * table created or renamed from another column?" {
                send "\r"
                exp_continue
            }
            eof
        }
    '
else
    # Alternative: use printf to send Enter key for all prompts
    # This selects the default (first) option
    printf '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n' | pnpm db:generate
fi