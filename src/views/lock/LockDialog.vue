<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="22vh"
      width="540px">
      <div class="lock_dialog">
        <div  class="dialog_head">
          <div class="dialog_title">
            <div class="dialog_tab" :class="dialogTab==1?'dialog_tab_actiive':''" @click="dialogTab=1"><span>{{this.$t('swap.swap37')}}</span> <sp></sp> </div>
            <div class="dialog_tab" :class="dialogTab==2?'dialog_tab_actiive':''" @click="dialogTab=2"><span>{{this.$t('swap.swap38')}}</span> <sp></sp></div>
          </div>
          <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div>
        </div>
        <div class="dialog_body" v-show="dialogTab==1">
          <p class="lock_title">{{this.$t('swap.swap39')}}</p>
          <div class="lock_detail">
            <input type="number" v-model="amount" oninput="if(value.length>15)value=value.slice(0,15)"><span>NULS</span>
          </div>
          <button class="lock_btn" @click="btnLock">{{this.$t('swap.swap37')}}</button>
          <p class="dialog_assets">{{this.$t('swap.swap40')}}：<span>{{accountDetail.balance}}</span> NULS</p>
        </div>
        <div class="dialog_body" v-show="dialogTab==2">
          <div class="reward_detail" v-if="isDrewardTime">
            <p class="reward_txt">{{this.$t('swap.swap41')}}</p>
            <p class="reward_txt">{{lockBalance}}<span> NULS</span></p>
            <p class="reward_txt">{{this.$t('swap.swap42')}}</p>
            <p class="reward_txt reward_txt_last">{{earned}}<span> GOBLIN</span></p>
          </div>
          <div class="reward_detail" v-else>
            <p class="reward_txt">{{this.$t('swap.swap43')}}</p>
            <p class="reward_time">{{this.$t('swap.swap44')}}</p>
          </div>
          <button class="reward_btn reward_btn_op" :class="isBtnNo?'reward_btn_no':''" v-if="isDrewardTime" @click="btnReward">{{this.$t('swap.swap38')}}</button>
          <button class="reward_btn reward_btn_op" :class="isBtnNo?'reward_btn_no':''" v-else-if="!isDrewardTime && isDrewardTimeBtn" >{{this.$t('swap.swap55')}}</button>
          <button class="reward_btn" :class="isBtnNo?'reward_btn_no':''" v-else>{{this.$t('swap.swap38')}}</button>
        </div>
      </div>
    </el-dialog>
    <password-bar v-if="isPass==1" :type="passType" @dialogClose="dialogFatherClose" @passwordSubmitReward="passSubmitReward"  @passwordSubmitLock="passSubmitLock"></password-bar>
  </div>
</template>

<script>
import nuls from 'nuls-sdk-js'
import sdk from 'nuls-sdk-js/lib/api/sdk'
import utils from 'nuls-sdk-js/lib/utils/utils'
import {MAIN_INFO} from '@/config.js'
import {chainIdNumber,Times,chainID,Plus,getArgs,timesDecimals,timesDecimals0,Division,passwordVerification,Minus,divisionDecimals} from '@/api/util'
import {inputsOrOutputs,countFee,validateAndBroadcast,getNulsBalance} from '@/api/requestData'
import passwordBar from "../../components/Password"
export default {
  props:['lockBalance','earned'],
  components:{
    passwordBar
  },
  data() {  
    return {
      isPass:0,
      passType:0,
      dialogVisible: true,
      dialogTab:1,
      isBtnNo: true,
      isDrewardTime:false,//在9月30日12点 true  数量显示，可收获GOBLIN，不可解锁NULS
      isDrewardTimeBtn:false,  //10月10日中午12点后可以解锁NULS和收获goblin。   解锁功能 未完成
      balanceInfo:"",
      accountDetail:"",
      addressContract:"",
      amount:"",
      price: 25, 
      gasNumber:0, 
      prefix: '',//地址前缀
      newArgs: [],//合约参数
      //调用接口form
      callForm: {
        modelData: [],
        modelValue: '',
        parameterList: [
          {
            name: "amount",
            required: false,
            type: "BigInteger",
            value:  ""
          }
        ],
        senior: false,
        gas: 0, 
        price: 25,
        values: 0,
      },
      contractCallData: {},//调用合约data
      gasInfo: {number: 0, oldNumber: 0},//gas信息
      transferForm: {
        fromAddress: '',
        toAddress: '',
        assetType: '',
        amount: '',
        gas: 1,
        price: 25,
        remarks: '',
        fee: 0.001
      },
      assetsInfo: {},//选中的资产信息
      defaultInfo: {},//默认链信息
    };
  },
  mounted() {
    let chain = localStorage.getItem(chainIdNumber());
    this.accountDetail = chain?JSON.parse(chain)[0]:"";
    this.callForm.parameterList[0].value = timesDecimals0(this.lockBalance).c[0];
    this.addressContract = this.$store.getters.getAddressContract;
    this.transferForm.fromAddress = this.accountDetail.address;

    this.defaultInfo = JSON.parse(sessionStorage.getItem('info'))
    this.getBalanceByAddress(chainID(), 1, this.accountDetail.address);
    this.getCapitalListByAddress(this.accountDetail.address);
    if(this.earned<=0){
      this.isBtnNo = true;
    }else {
      this.isBtnNo = false;
    }
  },
  methods: {
    btnDialogClose(){
      this.$emit("dialogClose",0)
    },
    dialogFatherClose(el){
      this.isPass = el;
    },
    btnReward(){
      this.newArgs = getArgs(this.callForm.parameterList);
      if (this.newArgs.allParameter) {
        this.imputedContractCallGas(this.accountDetail.address, 0, this.addressContract, "withdraw", "(BigInteger amount) return void", this.newArgs.args)
      }
    },
    btnLock(){
      if(Number(this.amount)<10){
        this.$message({message: this.$t('swap.transfer13'), type: 'error', duration: 1000});
        return false;
      }
      if(Number(this.amount)>Number(this.accountDetail.balance)){
        this.$message({message: this.$t('swap.transfer14'), type: 'error', duration: 1000});
        return false;
      }
      this.validateContractCall();
    },
    /**
     * 验证调用合约交易
     * @param sender
     * @param value
     * @param gasLimit
     * @param price
     * @param contractAddress
     * @param methodName
     * @param methodDesc
     * @param args
     */
    
    async validateContractCall() {
      let gasLimit = sdk.CONTRACT_MAX_GASLIMIT;
      let price = this.price;
      let contractAddress = this.$store.getters.getAddressContract;
      let methodName = '_payable';
      let methodDesc = '';
      let args = [];
      await this.$post('/', 'validateContractCall', [this.accountDetail.address, Number(Times(this.amount, 100000000)), gasLimit, price, contractAddress, methodName, methodDesc, args])
        .then((response) => {
          //console.log(response);
          if (response.hasOwnProperty("result")) {
            //return {success: true, data: response.result};
            this.imputedContractCallGasLock(this.accountDetail.address, Number(Times(this.amount, 100000000)), contractAddress, methodName, methodDesc, args)
          } else {
            this.$message({message: this.$t('call.call6'), type: 'error', duration: 1000});
          }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call7') + error, type: 'error', duration: 1000});
        });
    },
    /**
       * 预估调用合约交易的gas
       * @param sender
       * @param value
       * @param contractAddress
       * @param methodName
       * @param methodDesc
       * @param args
       */
      async imputedContractCallGasLock(sender, value, contractAddress, methodName, methodDesc, args) {
        return await this.$post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args])
          .then(async (response) => {
            if (response.hasOwnProperty("result")) {
              this.gasInfo.number = response.result.gasLimit;
              this.transferForm.gas = response.result.gasLimit;
              this.transferForm.fee = Number(Plus(Number(Division(Number(Times(this.transferForm.gas, this.transferForm.price)), 10000000)), 0.001));
              this.contractFee = this.transferForm.fee;
              let contractConstructorArgsTypes = await this.getContractMethodArgsTypes(contractAddress, methodName);
              if (!contractConstructorArgsTypes.success) {
                console.log(JSON.stringify(contractConstructorArgsTypes.data));
                return;
              }
              let newArgs = utils.twoDimensionalArray(args, contractConstructorArgsTypes.data);
              this.contractCallData = {
                chainId: MAIN_INFO.chainId,
                sender: sender,
                contractAddress: contractAddress,
                value: value,
                gasLimit: this.transferForm.gas,
                price: this.transferForm.price,
                methodName: methodName,
                methodDesc: methodDesc,
                args: newArgs
              };
              this.passType = 2;
              this.isPass = 1;
              
            } else {
              this.$message({message: this.$t('call.call4'), type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            this.$message({message: this.$t('call.call5') + error, type: 'error', duration: 1000});
          });
      },
      /**
       *  获取密码框的密码  锁定  Submit
       * @param password
       **/
      async passSubmitLock(password) {
        this.isPass = 0;
        let passwordInfo = await passwordVerification(this.accountDetail, password);
        console.log(passwordInfo)
        if (!passwordInfo.success) {
          this.$message({message: this.$t('address.address13'), type: 'error', duration: 3000});
          return;
        }

        this.transferDiolog = false;
        this.transferLoading = true;
        this.balanceInfo = await this.getNulsBalance(this.assetsInfo.chainId, this.assetsInfo.assetId, this.transferForm.fromAddress);
        //console.log(this.balanceInfo);
        this.transferForm.amount = this.amount;
        let transferInfo = {
          fromAddress: this.transferForm.fromAddress,
          toAddress: this.addressContract,
          assetType: "NULS",
          amount: Number(timesDecimals0(this.transferForm.amount, this.assetsInfo.decimals)),
          gas: this.transferForm.gas,
          price: this.transferForm.price,
          remarks: this.transferForm.remarks,
          fee: Number(timesDecimals0(this.transferForm.fee, this.defaultInfo.defaultAsset.decimals)),
          assetsChainId: this.assetsInfo.chainId,
          assetsId: this.assetsInfo.assetId,
        };

        let inOrOutputs = {};
        let tAssemble = [];
        let txHex = "";//交易签名
          this.contractCallData.chainId = MAIN_INFO.chainId;
          transferInfo.value = Number(transferInfo.amount);
          transferInfo.amount = Number(Plus(transferInfo.fee, Number(Times(this.transferForm.gas, this.transferForm.price)))).toString();
          transferInfo.amount = Number(Plus(transferInfo.amount, transferInfo.value)).toString();
          inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
         tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, "", 16, this.contractCallData);
        
        txHex = await nuls.transactionSerialize(passwordInfo.pri, passwordInfo.pub, tAssemble);
        //console.log(txHex);
        let broadcastResult = await validateAndBroadcast(txHex);
        console.log(broadcastResult);
        if (!broadcastResult.success) {
          this.$message({
            message: this.$t('tips.tips14') + JSON.stringify(broadcastResult.data),
            type: 'error',
            duration: 3000
          });
        } else {
          this.$emit("dialogClose",7);
          localStorage.setItem("succType",1);
          localStorage.setItem("lockNum",this.transferForm.amount);
          localStorage.setItem("lockHash",broadcastResult.hash);
          this.transferLoading = false;
        }
      },
      /**
       * 获取地址的资金列表
       * @param address
       **/
      async getCapitalListByAddress(address) {
        this.transferLoading = true;
        //获取本连的基本资产
        let basicAssets = [];
        let chainId = MAIN_INFO.chainId; //记录主链id
        await this.$post('/', 'getAccountLedgerList', [address])
          .then((response) => {
            //console.log(response.result);
            if (response.hasOwnProperty("result")) {
              for (let item of response.result) {
                basicAssets.push({
                  type: 1,
                  symbol: item.symbol,
                  chainId: item.chainId,
                  assetId: item.assetId,
                  balance: timesDecimals(item.balance),
                  decimals: item.decimals,
                });
                chainId = item.chainId;
              }
            }
          })
          .catch((error) => {
            console.log("getAccountLedgerList:" + error);
            this.assetsListLoading = false;
            setTimeout(() => {
              //this.getCapitalListByAddress(address)
            }, 800);
            return;
          });
        ///console.log(basicAssets);

        //获取本连的合约资产
        let contractAssets = [];
        await this.$post('/', 'getAccountTokens', [1, 100, address])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let itme of response.result.list) {
                contractAssets.push({
                  type: 2,
                  symbol: itme.tokenSymbol,
                  chainId: chainId,
                  assetId: 1,
                  status: itme.status,
                  // balance: timesDecimals(itme.balance, itme.decimals),
                  balance: divisionDecimals(Minus(itme.balance, itme.lockedBalance), itme.decimals),
                  contractAddress: itme.contractAddress,
                  decimals: itme.decimals
                })
              }
            }
          })
          .catch((error) => {
            console.log("getAccountTokens:" + error);
            setTimeout(() => {
              //this.getCapitalListByAddress(address)
            }, 800);
            return;
          });

        const newContractAssets = contractAssets.filter(obj => obj.status !== 3); //隐藏已经删除合约
        //console.log(contractAssets);

        //获取跨链的基本资产
        let crossAssets = [];
        await this.$post('/', 'getAccountCrossLedgerList', [address])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let item of response.result) {
                crossAssets.push({
                  type: 1,
                  symbol: item.symbol,
                  chainId: item.chainId,
                  assetId: item.assetId,
                  balance: timesDecimals(item.balance, item.decimals),
                  decimals: item.decimals
                })
              }
            }
          })
          .catch((err) => {
            console.log("getAccountCrossLedgerList:" + err);
            setTimeout(() => {
              // this.getCapitalListByAddress(address)
            }, 800);
            return;
          });
        //console.log(crossAssets);

        this.assetsList = [...basicAssets, ...newContractAssets, ...crossAssets];

        //console.log(this.$route.query.accountType);
        let newInfo = this.$route.query.accountType ? this.$route.query.accountType : {type: 1, tokenSymbol: MAIN_INFO};
        if (this.$route.query.accountType === 'NULS') {
          newInfo = {type: 1, tokenSymbol: MAIN_INFO};
          newInfo.tokenSymbol.symbol = 'NULS';
        }
        if (!newInfo.contractAddress && !newInfo.tokenSymbol.symbol) {
          newInfo.tokenSymbol.symbol = 'NULS';
        }
        if (newInfo.contractAddress) {
          newInfo.symbol = newInfo.tokenSymbol;
          newInfo.tokenSymbol = newInfo;
        }
        //console.log(newInfo);

        for (let item of this.assetsList) {
          //console.log(item);
          if (item.type === 1) {
            if (item.assetId === newInfo.tokenSymbol.assetId && item.chainId === newInfo.tokenSymbol.chainId) {
              this.changeType(item);
              this.transferLoading = false;
              return
            }
          } else {
            if (item.contractAddress && item.contractAddress === newInfo.contractAddress) {
              this.changeType(item);
              this.transferLoading = false;
              return;
            }
          }
        }
        this.transferLoading = false;
      },
      /**
       * 资产类型选择
       * @param type
       **/
      async changeType(type) {
        //console.log(type);
        this.assetsInfo = type;
        this.transferForm.assetType = type.symbol;
        this.parameterValidation();
        if (this.transferForm.amount !== '') {
          this.$refs.transferForm.validateField('amount');
        }
      },
      /**
       * @disc: 参数验证
       * @params:
       * @date: 2020-07-02 14:21
       * @author: Wave
       */
      parameterValidation() {
        if (this.transferForm.toAddress && this.transferForm.amount) {
          if (this.assetsInfo.type === 1) { //主链资产
            if (this.toAddressInfo.type === 2) { //合约地址
              if (this.assetsInfo.chainId === MAIN_INFO.chainId && this.assetsInfo.assetId === MAIN_INFO.assetId) {
                this.toAddressInfo.transferType = 3; //3：向合约地址转NULS
                this.transferPayable();
              } else {
                this.toAddressInfo.amount = '';
                this.$message({message: this.$t('transfer.transfer25'), type: 'error', duration: 3000});
              }
            }
          } else { //合约资产
            if (this.toAddressInfo.type === 1) { //普通地址
              this.toAddressInfo.transferType = 2; // 2：token转账
            } else { //合约地址
              this.toAddressInfo.transferType = 4; // 4：向合约地址转token
            }
            this.transferTransfer();
          }
        }
      },
      /**
       * 获取转出地址余额信息
       *  @param assetChainId
       *  @param assetId
       *  @param address
       **/
      async getNulsBalance(assetChainId, assetId, address) {
        try {
          let resData = await getNulsBalance(assetChainId, assetId, address);
          //console.log(resData);
          if (resData.success) {
            return resData.data
          } else {
            return {}
          }
        } catch (error) {
          console.log(error);
          return {}
        }
      },
      /**
       * 查询账户详情根据别名
       * @param alias
       **/
      async getAccountByAlias(alias) {
        try {
          let resData = await this.$post('/', 'getAccountByAlias', [alias]);
          //console.log(resData);
          if (resData.hasOwnProperty("result")) {
            this.aliasToAddress = resData.result.address;
            this.toAddressInfo = nuls.verifyAddress(this.aliasToAddress);
            if (this.toAddressInfo.type === 1) { //主链地址
              await this.verifyToAddress();
            }
            return {success: true}
          } else {
            this.aliasToAddress = '';
            return {success: false}
          }
        } catch (err) {
          console.log(err);
          return {success: false}
        }
      },

    /**
     * 收获  Submit
     **/
    async passSubmitReward(password){
      this.isPass = 0;
      const pri = nuls.decrypteOfAES(this.accountDetail.aesPri, password);
      const newAddressInfo = nuls.importByKey(chainID(), pri, password, this.prefix);
      if (newAddressInfo.address === this.accountDetail.address) {
        //console.log(this.selectionData);
          let pub = this.accountDetail.pub;
          let amount = Number(Times(this.gasNumber, this.price));
          console.log(this.gasNumber, this.price,amount)
          let transferInfo = {
            fromAddress: this.accountDetail.address,
            assetsChainId: chainID(),
            assetsId: 1,
            amount: amount,
            fee: 100000
          };
          amount = Number(Plus(transferInfo.fee, amount));
          let remark = '';
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
          console.log(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
          console.log(11111,tAssemble)
         let txhex = '';
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //手续费大于0.001的时候重新组装交易及签名
          console.log(transferInfo.fee , newFee)
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          }
          
          console.log(txhex);
          //验证并广播交易
          await validateAndBroadcast(txhex).then((response) => {
            console.log(response);
            if (response.success) {
              this.callResult = response
              this.$emit("dialogClose",7);
              localStorage.setItem("succType",2);
              localStorage.setItem("rewardNum",timesDecimals(amount));
              localStorage.setItem("hash",response.hash);
            } else {
              if (response.data.code === 'err_0014') {
                this.$message({message: response.data.message, type: 'error', duration: 3000});
              } else {
                this.$message({message: this.$t('error.' + response.data.code), type: 'error', duration: 3000});
              }
            }
          }).catch((err) => {
            this.$message({message: this.$t('public.err1') + err, type: 'error', duration: 3000});
          });

      }else{
        this.$message({message: this.$t('address.address13'), type: 'error', duration: 3000});
      }
    },
    /**
     * 获取账户余额
     * @param assetChainId
     * @param assetId
     * @param address
     **/
    getBalanceByAddress(assetChainId, assetId, address) {
      getNulsBalance(assetChainId, assetId, address).then((response) => {
        //console.log(response);
        if (response.success) {
          this.balanceInfo = response.data;
          
        } else {
          this.$message({message: this.$t('public.err2') + response, type: 'error', duration: 3000});
        }
      }).catch((error) => {
        this.$message({message: this.$t('public.err3') + error, type: 'error', duration: 3000});
      });
    },
    
    /**
     * 预估调用合约交易的gas  （收获）
     * @param sender
     * @param value
     * @param contractAddress
     * @param methodName
     * @param methodDesc
     * @param args
     */
    async imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
      return await this.$post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args])
        .then(async (response) => {
          //console.log(response);
          if (response.hasOwnProperty("result")) {
            this.gasNumber = response.result.gasLimit;
            let contractConstructorArgsTypes = await this.getContractMethodArgsTypes(contractAddress, methodName, methodDesc);
            if (!contractConstructorArgsTypes.success) {
              this.$message({message: this.$t('call.call4') + response, type: 'error', duration: 3000});
              return;
            }
            
            let newArgs = utils.twoDimensionalArray(args, contractConstructorArgsTypes.data);
            this.contractCallData = {
              chainId: chainID(),
              sender: sender,
              contractAddress: contractAddress,
              value: value,
              gasLimit: this.gasNumber,
              price: this.callForm.price,
              methodName: methodName,
              methodDesc: methodDesc,
              args: newArgs
            };
            this.passType = 1;
            this.isPass = 1;
            
          } else {
            this.$message({message: this.$t('call.call4') + response, type: 'error', duration: 3000});
          }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call5') + JSON.stringify(error), type: 'error', duration: 3000});
        });
    },
    /**
     * 获取合约指定函数的参数类型
     * @param contractAddress
     * @param  methodName
     * @param  methodDesc
     */
    async getContractMethodArgsTypes(contractAddress, methodName, methodDesc) {
      return await this.$post('/', 'getContractMethodArgsTypes', [contractAddress, methodName, methodDesc])
        .then((response) => {
          //console.log(response);
          if (response.hasOwnProperty("result")) {
            return {success: true, data: response.result};
          } else {
            return {success: false, data: response.error};
          }
        })
        .catch((error) => {
          return {success: false, data: error};
        });
    },
  },
};
</script>
<style lang="less" scoped>
  /deep/.el-dialog {
    background: transparent;
  }
  /deep/ .el-dialog__header {
    display: none;
  }
  /deep/.el-dialog__body {
      background: #222222;
      box-shadow: 0px 1px 4px 0px rgba(255, 255, 255, 0.5);
      border-radius: 22px;
      padding: 29px 70px;
  }
  .lock_dialog {
    .reward_detail {
      border-radius: 12px;
      border: 1px solid #6FAF1E;
      margin-top: 36px;
      padding: 24px;
      .reward_txt {
        font-size: 20px;
        font-weight: 400;
        color: #BEBEBE;
        line-height: 18px;
        margin-bottom: 24px;
        span{
          color: #6FAF1E;
        }
      }
      .reward_txt_last {
        margin-bottom: 0;
      }
      .reward_time {
        font-size: 20px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 18px;
      }
    
    }
    .reward_btn {
      height: 58px;
      background: #5B5B5B;
      border-radius: 12px;
      font-size: 20px;
      font-weight: 600;
      color: #8C8C8C;
      line-height: 58px;
      letter-spacing: 1px;
      width: 100%;
      margin-top: 54px;
      cursor: pointer;
    }
    .reward_btn_op {
      background: #6FAF1E;
      color: #FFFFFF;
    }
    .reward_btn_no {
      color: #8C8C8C;
      background: #5B5B5B;
      pointer-events: none;
    }
    .lock_btn {
      cursor: pointer;
      height: 58px;
      background: #6FAF1E;
      border-radius: 12px;
      font-size: 20px;
      font-weight: 600;
      color: #FFFFFF;
      line-height: 58px;
      letter-spacing: 1px;
      width: 100%;
      margin-top: 54px;
    }
    
    .lock_title {
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 18px;
      letter-spacing: 1px;
      margin-top: 36px;
      text-align: left;
    }
    .lock_detail {
      border-radius: 12px;
      height: 58px;
      border: 1px solid #6FAF1E;
      margin-top: 16px;
      padding: 0px 24px;
      display: flex;
      input{
        width: 100%;
        font-size: 20px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 18px;
        letter-spacing: 1px;
        background: transparent;
      }
      span{
        flex-shrink: 0;
        font-size: 20px;
        font-weight: 400;
        color: #BEBEBE;
        line-height: 58px;
        letter-spacing: 1px;
        margin-left: 10px;
      }
      
    }
    .dialog_assets {
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 18px;
      letter-spacing: 1px;
      margin-top: 24px;
      span{
        color: #6FAF1E;
      }
    }
    
    .dialog_head {
      display: flex;
      justify-content: space-between;
      .dialog_title {
        display: flex;
        .dialog_tab {
          cursor: pointer;
          margin-right: 24px;
          font-size: 20px;
          font-weight: 400;
          color: #BEBEBE;
          line-height: 24px;
          position: relative;
           span{
            position: relative;
            z-index: 100;
          }
          sp{
            background: #7EC623;
            display: inline-block;
            width: 100%;
            height: 12px;
            position: absolute;
            bottom: 0px;
            left: 0;
            z-index: 99;
            display: none;
          }
        }
        .dialog_tab_actiive {
          font-size: 24px;
          position: relative;
          z-index: 100;
          sp{
            display: block;
          }
        }
      }
      .dialog_close {
        margin-top: -9px;
        margin-right: -50px;
        color: #ffffff;
        font-size: 30px;
        cursor: pointer;
      }
    }
  }
</style>
