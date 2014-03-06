// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
package com.cloud.hypervisor.hyperv.guru;

import javax.ejb.Local;
import javax.inject.Inject;

import org.apache.cloudstack.storage.command.CopyCommand;

import com.cloud.agent.api.Command;
import com.cloud.agent.api.to.DataObjectType;
import com.cloud.agent.api.to.VirtualMachineTO;
import com.cloud.hypervisor.HypervisorGuru;
import com.cloud.hypervisor.HypervisorGuruBase;
import com.cloud.hypervisor.Hypervisor.HypervisorType;
import com.cloud.storage.DataStoreRole;
import com.cloud.storage.GuestOSVO;
import com.cloud.storage.dao.GuestOSDao;
import com.cloud.utils.Pair;
import com.cloud.vm.VirtualMachine;
import com.cloud.vm.VirtualMachineProfile;

/**
 * Implementation of Hypervisor guru for Hyper-V.
 **/
@Local(value = HypervisorGuru.class)
public class HypervGuru extends HypervisorGuruBase implements HypervisorGuru {

    @Inject
    private GuestOSDao _guestOsDao;

    @Override
    public final HypervisorType getHypervisorType() {
        return HypervisorType.Hyperv;
    }
    /**
     * Prevent direct creation.
     */
    protected HypervGuru() {
        super();
    }

    @Override
    public final VirtualMachineTO implement(
            VirtualMachineProfile vm) {
        VirtualMachineTO to = toVirtualMachineTO(vm);

        // Determine the VM's OS description
        GuestOSVO guestOS = _guestOsDao.findById(vm.getVirtualMachine()
                .getGuestOSId());
        to.setOs(guestOS.getDisplayName());

        return to;
    }

    @Override
    public Pair<Boolean, Long> getCommandHostDelegation(long hostId, Command cmd) {
        if (cmd instanceof CopyCommand) {
            CopyCommand cc = (CopyCommand)cmd;
            boolean inSeq = true;
            if (cc.getDestTO().getDataStore().getRole() == DataStoreRole.Image || cc.getDestTO().getDataStore().getRole() == DataStoreRole.ImageCache) {
                inSeq = false;
            }
            cc.setExecuteInSequence(inSeq);
        }
        return new Pair<Boolean, Long>(false, new Long(hostId));
    }

    @Override
    public final boolean trackVmHostChange() {
        return false;
    }
}
