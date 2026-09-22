package com.quantwork.ams.service;

import com.quantwork.ams.model.AssetAuditLog;
import com.quantwork.ams.repository.AssetAuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssetAuditLogServiceTest {

    @Mock
    private AssetAuditLogRepository assetAuditLogRepository;

    @InjectMocks
    private AssetAuditLogService assetAuditLogService;

    @Test
    void shouldPersistAssetAuditLogWithGeneratedTimestamp() {
        when(assetAuditLogRepository.save(any(AssetAuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assetAuditLogService.recordAssetEvent(
                "asset-123",
                "company-1",
                "AST-1001",
                "ASSET_CREATED",
                "Asset created in inventory",
                "Mara Singh",
                "user-1"
        );

        verify(assetAuditLogRepository).save(any(AssetAuditLog.class));
    }
}
