import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Command } from 'commander';
import * as path from 'path';

// Define mocks
const mockGetTemplateDir = jest.fn();
const mockCopyTemplate = jest.fn();
const mockExistsSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockWriteFileSync = jest.fn();
const mockPrompt = jest.fn();
const mockEnsureDir = jest.fn();

// Register mocks
jest.unstable_mockModule('../../src/utils/files.js', () => ({
  copyTemplate: mockCopyTemplate,
}));

jest.unstable_mockModule('../../src/utils/paths.js', () => ({
  getTemplateDir: mockGetTemplateDir,
}));

jest.unstable_mockModule('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
}));

jest.unstable_mockModule('fs-extra', () => ({
  default: {
    ensureDir: mockEnsureDir,
  },
  ensureDir: mockEnsureDir,
}));

jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
  },
  prompt: mockPrompt,
}));

// Import the module under test
const { integrationCommand } = await import('../../src/commands/integration.js');

describe('integration command', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.addCommand(integrationCommand);
    jest.clearAllMocks();
    
    mockGetTemplateDir.mockReturnValue('/templates');
    mockExistsSync.mockReturnValue(true); // Default to being in an Anchor project
    mockReadFileSync.mockReturnValue(JSON.stringify({ name: 'test-proj', scripts: {} }));
  });

  it('should fail if not in an Anchor project', async () => {
    mockExistsSync.mockImplementation((p: string) => !p.endsWith('Anchor.toml'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'sol-scaffold', 'integration']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Anchor.toml not found'));
    expect(mockCopyTemplate).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should scaffold with default settings when using --yes', async () => {
    await program.parseAsync(['node', 'sol-scaffold', 'integration', '--yes']);

    expect(mockPrompt).not.toHaveBeenCalled();
    expect(mockCopyTemplate).toHaveBeenCalled();
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.stringContaining('test:int')
    );
  });

  it('should prompt for settings when not using --yes', async () => {
    mockPrompt.mockResolvedValue({
      enableForking: true,
      rpcUrl: 'http://test-rpc',
      protocols: ['spl', 'serum'],
    });

    // Mock first existsSync for Anchor.toml as true, and second for existing tests as false
    mockExistsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);

    await program.parseAsync(['node', 'sol-scaffold', 'integration']);

    expect(mockPrompt).toHaveBeenCalled();
    expect(mockCopyTemplate).toHaveBeenCalled();
  });

  it('should handle existing integration directory and ask for overwrite', async () => {
    // 1. Anchor.toml exists
    // 2. tests/integration exists
    mockExistsSync.mockReturnValue(true);
    mockPrompt.mockResolvedValueOnce({ confirm: false }); // User says NO to overwrite

    await program.parseAsync(['node', 'sol-scaffold', 'integration']);

    expect(mockPrompt).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'confirm', message: expect.stringContaining('Overwrite?') })
    ]));
    expect(mockCopyTemplate).not.toHaveBeenCalled();
  });
});
