# Depth-First Search (DFS)

Source: [`src/algorithms/dfs.js`](../src/algorithms/dfs.js)

## Idea

DFS follows one branch as **deep** as it can before backing up and trying another. It uses a **LIFO stack**, so the most recently generated node is always expanded next.

DFS needs very little memory, but it can find a long, wasteful path even when a short one exists, and on a graph with cycles it can wander forever. This implementation therefore adds two safeguards: a **depth limit** and a **cycle check along the current path**.

## Logic

1. Put the initial state on a **stack**.
2. Pop a node. If its depth is at least the **depth limit**, do not expand it. Mark it as **pruned** and continue.
3. Otherwise **expand** it: generate its neighbors (Up, Down, Left, Right).
4. Skip a neighbor if its state already appears **on the path from the root to the current node** (this prevents going back and forth in a loop).
5. Test each new neighbor against the goal when it is generated. If it is the goal, rebuild the path and stop.
6. Push the new children onto the stack in **reverse order**, so the first move (Up) is explored first.
7. When the stack is empty, fail. The reason is `depth-limit` if at least one node was pruned, otherwise `exhausted`.

### Depth limit

The state graph is finite, but the number of *paths* in it is enormous. Without a limit, DFS can go very deep along a useless branch. The limit (default **20**, configurable from 1 to 31 in the UI) turns the search into a bounded one. If the shallowest solution is deeper than the limit, DFS reports failure even though a solution exists.

### Cycle check on the path, not a global visited set

Only states on the *current path* are rejected. A state may still be generated again through a different branch. This keeps memory low, which is DFS's main advantage, at the price of repeated work. A global visited set would break the memory advantage and, combined with a depth limit, could even hide solutions.

## Pseudocode

```text
DFS(initial, limit):
    root ← Node(state = initial, parent = null, move = null)
    if GOAL(root.state):
        return PATH(root)

    stack  ← [root]
    cutoff ← false

    while stack is not empty:
        node ← stack.pop()                        # top of the stack

        if node.depth ≥ limit:
            cutoff ← true                         # pruned: not expanded
            continue

        children ← []
        for each (state, move) in NEIGHBORS(node.state):
            if state is on the path root → node:
                continue                          # cycle check
            child ← Node(state, parent = node, move = move)
            if GOAL(state):
                return PATH(child)
            children.append(child)

        for child in REVERSE(children):           # so "Up" is popped first
            stack.push(child)

    return FAILURE(cutoff ? "depth-limit" : "exhausted")
```

## Implementation notes

- `isOnPath(node, state)` walks the **parent links** from the current node up to the root, comparing states. It costs O(depth) per neighbor, which is small because the depth is at most the limit.
- Children are collected first and pushed in reverse order after the loop, so the resulting exploration order is Up, Down, Left, Right.
- `maxFrontier` is `stack.length + children.length` at the moment each child is generated.
- A node that reaches the depth limit is **generated but never expanded**. It is shown in the tree with a dashed red border (`pruned`).
- `maxGenerated` (default 500,000, and 200,000 from the UI) stops the search with `reason: 'node-limit'`.
- Because the exploration order is fixed, the same puzzle always gives the same path, but changing the order of moves would change it.

### Events emitted

| Event | When |
|---|---|
| `generate` | A node was created and pushed (also the root). |
| `expand` | A node was popped and its children are about to be generated. |
| `prune` | A popped node had reached the depth limit and was not expanded. |
| `goal` | The goal was found. Carries the `path`. |
| `fail` | `reason` is `depth-limit`, `exhausted` or `node-limit`. |

## Complexity

Let `b` be the branching factor and `m` the depth limit.

| Property | Value |
|---|---|
| Complete | No. Only if the limit is at least the depth of the shallowest solution. |
| Optimal | **No.** The first solution found may be much longer than the shortest one. |
| Time | O(b^m) |
| Space | O(b·m): one path plus the unexplored siblings along it |

## Example run

Initial state `0 5 2 1 8 3 4 7 6`, depth limit 12:

| Path length | Generated | Expanded | Max frontier |
|---|---|---|---|
| 8 | 60 | 34 | 12 |

DFS found an 8-move path here, the same length as BFS, and generated fewer nodes. That is luck of the move order, not a guarantee: on other puzzles DFS often returns a path several times longer than optimal.

## In the visualizer

The tree grows as a long, narrow chain that dives downward, with red dashed nodes appearing at the depth limit. The tree is usually much deeper and narrower than the BFS tree. Increasing the limit lets DFS find solutions that were out of reach, but the path it returns tends to get longer as well.

## When to use DFS

- Memory is tight.
- Any solution is acceptable and you do not need the shortest one.
- You have a good guess for the depth of the solution.

## Related

[BFS](BFS.md) · [IDS](IDS.md) · [Project README](../README.md)