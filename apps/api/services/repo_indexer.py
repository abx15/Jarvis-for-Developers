from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.repo_memory import File, CodeChunk
from services.github_service import GitHubService
from utils.logger import logger


class RepoIndexer:
    def __init__(self, db: Session, github_token: str):
        self.db = db
        self.github_service = GitHubService(github_token)
        
        # Simple text splitter implementation
        def split_text(text, chunk_size=1000, chunk_overlap=200):
            chunks = []
            start = 0
            while start < len(text):
                end = start + chunk_size
                if end > len(text):
                    end = len(text)
                chunks.append(text[start:end])
                start = end - chunk_overlap
                if start < 0:
                    start = 0
            return chunks
        
        self.text_splitter = split_text

    async def index_repository(self, owner: str, repo_name: str, db_repo_id: int) -> Dict[str, Any]:
        """Fetch, chunk, and index an entire repository"""
        logger.info(f"Starting indexing for repo: {owner}/{repo_name}")
        
        try:
            # 1. Fetch the repository tree
            tree = await self.github_service.get_repository_tree(owner, repo_name)
            
            # 2. Filter for code files
            code_files = self.github_service.filter_code_files(tree)
            logger.info(f"Found {len(code_files)} code files to process")
            
            processed_files = 0
            chunks_created = 0
            
            # 3. Process each file
            for file_item in code_files:
                path = file_item["path"]
                sha = file_item["sha"]
                
                # Fetch content
                content = await self.github_service.get_file_content(owner, repo_name, sha)
                if not content:
                    continue
                
                # Determine language (simple extension based)
                import os
                _, ext = os.path.splitext(path)
                language = ext[1:] if ext else "plaintext"
                
                # Save file to DB
                db_file = File(
                    repo_id=db_repo_id,
                    file_path=path,
                    content=content,
                    language=language
                )
                self.db.add(db_file)
                self.db.commit()
                self.db.refresh(db_file)
                
                # 4. Split into chunks and save
                chunks = self.chunk_file(content)
                for i, chunk_text in enumerate(chunks):
                    db_chunk = CodeChunk(
                        file_id=db_file.id,
                        chunk_text=chunk_text,
                        # Approximation for line numbers, a full parser would be better
                        start_line=content[:content.find(chunk_text)].count('\n') + 1 if chunk_text in content else None,
                        end_line=None  # We'll skip end_line calculation for performance unless needed
                    )
                    self.db.add(db_chunk)
                    chunks_created += 1
                
                self.db.commit()
                processed_files += 1
                
                if processed_files % 10 == 0:
                    logger.info(f"Processed {processed_files}/{len(code_files)} files...")
                    
            logger.info(f"Indexing complete. Processed {processed_files} files, created {chunks_created} chunks.")
            
            return {
                "status": "success",
                "files_processed": processed_files,
                "chunks_created": chunks_created
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error during repository indexing: {e}")
            raise

    def chunk_file(self, content: str) -> List[str]:
        """Split file content into smaller, semantically meaningful chunks"""
        if not content.strip():
            return []
            
        return self.text_splitter.split_text(content)
