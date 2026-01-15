# Implement Command

Execute an implementation plan step-by-step with tests.

## Input

$ARGUMENTS - Either a plan (from /plan) or a feature description to implement

## Instructions

### Phase 1: Preparation

1. **Parse the Plan**
   - If given a plan, extract the ordered steps
   - If given a feature description, create a quick plan first

2. **Verify Prerequisites**
   ```bash
   npm run compile  # Ensure project builds
   npm test         # Ensure existing tests pass
   ```

3. **Read Relevant Files**
   - Read all files that will be modified
   - Understand existing patterns and conventions

### Phase 2: Implementation

For each step in the plan:

1. **Make the Change**
   - Follow existing code patterns
   - Use TypeScript strict mode conventions
   - Keep changes minimal and focused

2. **Verify Compilation**
   ```bash
   npm run compile
   ```
   Fix any type errors before proceeding.

3. **Write/Update Tests**
   - Add tests for new functionality
   - Update existing tests if behavior changed
   - Follow existing test patterns in `src/test/suite/`

4. **Run Tests**
   ```bash
   npm test
   ```
   Fix any failing tests before proceeding.

### Phase 3: Verification

1. **Final Build**
   ```bash
   npm run compile && npm run lint && npm test
   ```

2. **Review Changes**
   - List all files modified
   - Summarize what was done
   - Note any deviations from the plan

### Output Format

```markdown
## Implementation Complete: [Feature Name]

### Changes Made

#### [file path]
- [Change description]

### Tests Added/Modified
- [Test file]: [What was tested]

### Verification
- [ ] Compiles without errors
- [ ] All tests pass
- [ ] Lint passes

### Summary
[What was implemented and any notes]

### Next Steps (if any)
- [Documentation updates needed]
- [Manual testing recommended]
```

## Guidelines

### Code Style
- Match existing patterns in the codebase
- Use async/await for asynchronous code
- Add explicit return types
- Handle errors gracefully

### Testing
- One assertion per test when possible
- Use descriptive test names: "should X when Y"
- Mock VS Code APIs appropriately

### Common Patterns

**Adding to ExtensionConfig:**
```typescript
// src/types/index.ts
export interface ExtensionConfig {
  // ... existing properties
  newOption: boolean;  // Add with JSDoc comment
}
```

**Reading configuration:**
```typescript
// src/utils/index.ts
export function getExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration('resetSizes');
  return {
    // ... existing
    newOption: config.get<boolean>('newOption', false),
  };
}
```

**Adding a test:**
```typescript
// src/test/suite/utils.test.ts
describe('getExtensionConfig', () => {
  it('should read newOption with default false', () => {
    // Arrange
    mockConfig.get.withArgs('newOption').returns(undefined);

    // Act
    const config = getExtensionConfig();

    // Assert
    assert.strictEqual(config.newOption, false);
  });
});
```

## Error Handling

If compilation fails:
1. Read the error message carefully
2. Check for type mismatches
3. Ensure imports are correct
4. Fix and re-run compile

If tests fail:
1. Read the test output
2. Identify which test failed and why
3. Determine if test or implementation needs fixing
4. Fix and re-run tests
